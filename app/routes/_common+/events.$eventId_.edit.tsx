import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { useRef } from "react";
import { EventFormFields } from "~/components/";
import { prisma, requireUserSession } from "~/services";
import { eventSchema } from "~/validations";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.event?.title} ~ Seek Gathering` }];
};

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log(data);
  const result = eventSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    return errors;
  }
  await prisma.event.update({
    where: { id: params.eventId },
    data: result.data,
  });
  return redirect(`/events/${params.eventId}`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  return { event };
}

export default function EditEvent() {
  const errors = useActionData<typeof action>();
  const { event } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const submit = useSubmit();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const $form = event.currentTarget;
    const formData = new FormData($form);
    const description = mdxEditorRef.current?.getMarkdown();
    formData.set("description", description ?? "");
    submit(formData, {
      method: ($form.getAttribute("method") ?? $form.method) as "GET" | "POST",
      action: $form.getAttribute("action") ?? $form.action,
    });
  };
  return (
    <Form method="post" onSubmit={handleSubmit}>
      <h1 className="mb-8 text-3xl sm:text-4xl">Editing {event.title}</h1>
      <EventFormFields
        event={event}
        errors={errors}
        mdxEditorRef={mdxEditorRef}
      />
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="rounded border border-transparent bg-amber-800 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          className="rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
