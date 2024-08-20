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
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useRef } from "react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { descriptionEditorStyles, EventFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { EventStatus } from "~/utils";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "New event ~ SeekGathering" }];
};

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await eventFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.event.create({
    data: { ...result.data, status: EventStatus.DRAFT },
  });
  return redirectWithSuccess(
    `/events/${result.data.slug}`,
    "Event saved as a draft",
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return null;
}

export default function EventNew() {
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const submit = useSubmit();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    const dateEnd = formData.get("dateEnd");
    const dateStart = formData.get("dateStart");
    const description = mdxEditorRef.current?.getMarkdown();
    if (dateStart !== null && dateStart !== "" && dateEnd === "") {
      formData.set("dateEnd", dateStart);
    }
    if (dateEnd !== null && dateEnd !== "" && dateStart === "") {
      formData.set("dateStart", dateEnd);
    }
    formData.set("description", description ?? "");
    submit(formData, { method: "POST" });
  };
  return (
    <Form onSubmit={handleSubmit}>
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-relaxed sm:text-4xl sm:leading-relaxed">
          <svg
            className="h-8 w-8 text-amber-600 max-[452px]:hidden sm:h-10 sm:w-10"
            width="16px"
            height="16px"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
          <span>New event</span>
        </h1>
        <EventFormFields errors={errors} mdxEditorRef={mdxEditorRef} />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
