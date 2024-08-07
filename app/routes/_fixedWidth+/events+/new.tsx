import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
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
import { EventFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Add event ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await eventFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.event.create({ data: result.data });
  return redirectWithSuccess("/events", "Event added");
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
    const description = mdxEditorRef.current?.getMarkdown();
    formData.set("description", description ?? "");
    submit(formData, {
      method: ($form.getAttribute("method") ?? $form.method) as "GET" | "POST",
      action: $form.getAttribute("action") ?? $form.action,
    });
  };
  return (
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
        <h1 className="text-3xl font-bold sm:text-4xl">Add event</h1>
        <EventFormFields errors={errors} mdxEditorRef={mdxEditorRef} />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
          >
            Add
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
