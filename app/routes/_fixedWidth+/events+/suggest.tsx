import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { createId } from "@paralleldrive/cuid2";
import {
  Form,
  redirect,
  useActionData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { useRef } from "react";
import { EventFormFields } from "~/components";
import { authenticator, prisma } from "~/services";
import { enumEventStatus } from "~/utils";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Suggest event ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await eventFormSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten();
  }
  await prisma.event.create({
    data: { ...result.data, status: enumEventStatus.SUGGESTED },
  });
  return redirect("/events");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/events/new",
  });
  return null;
}

export default function NewEvent() {
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const submit = useSubmit();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    const description = mdxEditorRef.current?.getMarkdown();
    formData.set("slug", createId());
    formData.set("description", description ?? "");
    submit(formData, {
      method: ($form.getAttribute("method") ?? $form.method) as "GET" | "POST",
      action: $form.getAttribute("action") ?? $form.action,
    });
  };
  return (
    <Form method="post" onSubmit={handleSubmit} className="grid gap-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Suggest a new event</h1>
      <p className="text-lg sm:text-xl">
        Do you know of any conscious festival that deserves to be known and
        found by like-minded people from around the world?
      </p>
      <p className="text-lg sm:text-xl">
        Suggesting it will support not only the event but also other seekers.
      </p>
      <p className="text-lg sm:text-xl">
        If you choose to do so, I&apos;d like to kindly ask you to fill in the
        title, the country, and the dates the suggested event is happening in.
        Thank you very much 🙏
      </p>
      <hr className="border-amber-600" />
      <p className="text-center text-lg font-semibold sm:text-xl">
        Let&apos;s create this portal together!
      </p>
      <hr className="border-amber-600" />
      <EventFormFields
        errors={errors}
        mdxEditorRef={mdxEditorRef}
        isSuggestion
      />
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Suggest event
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}