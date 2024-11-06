import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useRef, useState } from "react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import {
  descriptionEditorStyles,
  EventFormFields,
  ImageUpload,
} from "~/components";
import { prisma, requireUserSession } from "~/services";
import { EventStatus } from "~/utils";
import { moveFileInB2 } from "~/utils/b2s3Functions.server";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Add a new event ~ SpiritEvents.cz" }];
};

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = eventFormSchema.safeParse(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  const categoryIds: string[] = result.data.categories;
  delete result.data.categories;
  const event = await prisma.event.create({
    data: {
      ...result.data,
      categories: { connect: categoryIds.map((id) => ({ id })) },
      status: EventStatus.DRAFT,
    },
  });
  if (
    result.data.imageKey &&
    result.data.imageKey !== "" &&
    result.data.imageId &&
    result.data.imageId !== ""
  ) {
    await moveFileInB2(result.data.imageKey, result.data.imageId);
  }
  return redirectWithSuccess(
    `/events/${event.id}-${event.slug}`,
    "Event saved as a draft",
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const categories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
  });
  return { categories };
}

export default function EventNew() {
  const errors = useActionData<typeof action>();
  const { categories } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [imageBlurHashState, setImageBlurHashState] = useState("");
  const [imageIdState, setImageIdState] = useState("");
  const [imageKeyState, setImageKeyState] = useState("");
  const submit = useSubmit();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    const categories = formData.getAll("category");
    const dateEnd = formData.get("dateEnd");
    const dateStart = formData.get("dateStart");
    const description = mdxEditorRef.current?.getMarkdown();
    const timeEnd = formData.get("timeEnd");
    const timeStart = formData.get("timeStart");
    formData.delete("category");
    formData.set("categories", JSON.stringify(categories));
    if (dateStart !== null && dateStart !== "" && dateEnd === "") {
      formData.set("dateEnd", dateStart);
    }
    if (dateEnd !== null && dateEnd !== "" && dateStart === "") {
      formData.set("dateStart", dateEnd);
    }
    formData.set("description", description ?? "");
    if (timeEnd !== null && timeStart === "" && timeEnd !== "") {
      formData.set("timeEnd", "");
    }
    submit(formData, { method: "POST" });
  };
  return (
    <div className="mx-auto grid w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
      <div className="grid gap-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">
          <svg
            className="h-8 w-8 shrink-0 text-amber-600 max-xl:hidden sm:h-10 sm:w-10"
            width="16px"
            height="16px"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>Add a new event</span>
        </h1>
        <div className="grid gap-4">
          <ImageUpload
            disabled={navigation.state !== "idle"}
            onBlurHashChange={setImageBlurHashState}
            onFileChange={setFileSelected}
            onIdChange={setImageIdState}
            onKeyChange={setImageKeyState}
          />
          <Form onSubmit={handleSubmit}>
            <fieldset
              className="grid gap-4"
              disabled={navigation.state !== "idle"}
            >
              <input
                type="hidden"
                name="imageBlurHash"
                value={imageBlurHashState}
              />
              <input type="hidden" name="imageId" value={imageIdState} />
              <input type="hidden" name="imageKey" value={imageKeyState} />
              <EventFormFields
                categories={categories}
                errors={errors}
                mdxEditorRef={mdxEditorRef}
              />
              <div className="flex justify-end gap-4">
                {fileSelected ? (
                  <button
                    type="button"
                    className="rounded border border-emerald-600 bg-white px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                    onClick={() => {
                      const el = document.getElementById("imageUploadButton");
                      if (el) {
                        el.focus();
                      }
                    }}
                  >
                    Upload image first
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                  >
                    Save as draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:border-white dark:text-white"
                >
                  Back
                </button>
              </div>
            </fieldset>
          </Form>
        </div>
      </div>
    </div>
  );
}
