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
import { useRef } from "react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { descriptionEditorStyles, EventFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { EventStatus } from "~/utils";
import { eventFormSchema } from "~/validations";

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.event?.title} ~ SeekGathering` }];
};

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const status = data.originStatus;
  const result = await eventFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  delete result.data.originSlug;
  delete result.data.originStatus;
  await prisma.event.update({
    data:
      status === EventStatus.SUGGESTED
        ? { ...result.data, status: EventStatus.DRAFT }
        : result.data,
    where: { slug: params.slug },
  });
  return redirectWithSuccess(`/events/${result.data.slug}`, "Event saved");
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  return { event };
}

export default function EventEdit() {
  const errors = useActionData<typeof action>();
  const { event } = useLoaderData<typeof loader>();
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
    formData.set("originSlug", event.slug);
    formData.set("originStatus", event.status);
    submit(formData, { method: "POST", replace: true });
  };
  return (
    <Form onSubmit={handleSubmit}>
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
        <h1 className="flex items-center gap-2 text-3xl font-bold sm:text-4xl">
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
              d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
          <span>Editing {event.title}</span>
        </h1>
        <EventFormFields
          event={event}
          errors={errors}
          mdxEditorRef={mdxEditorRef}
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Save
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
