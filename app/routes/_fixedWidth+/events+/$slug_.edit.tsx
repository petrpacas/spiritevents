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
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useRef } from "react";
import { EventFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { enumEventStatus } from "~/utils";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.event?.title} ~ SeekGathering` }];
};

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const dataWithOgSlugAndStatus = Object.fromEntries(formData);
  const status = dataWithOgSlugAndStatus.status;
  const dataWithOgSlug = { ...dataWithOgSlugAndStatus };
  delete dataWithOgSlug.status;
  const result = await eventFormSchema.safeParseAsync(dataWithOgSlug);
  if (!result.success) {
    return result.error.flatten();
  }
  const data = { ...result.data };
  delete data.ogSlug;
  await prisma.event.update({
    data:
      status === enumEventStatus.SUGGESTED
        ? { ...data, status: enumEventStatus.DRAFT }
        : { ...data },

    where: { slug: params.slug },
  });
  return redirect(`/events/${result.data.slug}`);
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

export default function EditEvent() {
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
    const description = mdxEditorRef.current?.getMarkdown();
    formData.set("description", description ?? "");
    formData.set("ogSlug", event.slug ?? "");
    formData.set("status", event.status);
    submit(formData, {
      method: ($form.getAttribute("method") ?? $form.method) as "GET" | "POST",
      action: $form.getAttribute("action") ?? $form.action,
    });
  };
  return (
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Editing {event.title}
        </h1>
        <EventFormFields
          event={event}
          errors={errors}
          mdxEditorRef={mdxEditorRef}
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
