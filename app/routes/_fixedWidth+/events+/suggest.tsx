import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { createId } from "@paralleldrive/cuid2";
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
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.event.create({
    data: { ...result.data, status: enumEventStatus.SUGGESTED },
  });
  return redirectWithSuccess("/events", "Thank you!");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/events/new",
  });
  return null;
}

export default function EventSuggest() {
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
    formData.set("slug", createId());
    formData.set("description", description ?? "");
    submit(formData, {
      method: ($form.getAttribute("method") ?? $form.method) as "GET" | "POST",
      action: $form.getAttribute("action") ?? $form.action,
    });
  };
  return (
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
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
        <hr className="mt-8 border-amber-600" />
        <p className="text-center text-lg font-semibold sm:text-xl">
          Let&apos;s make this place a true portal together
        </p>
        <hr className="mb-8 border-amber-600" />
        <EventFormFields
          errors={errors}
          mdxEditorRef={mdxEditorRef}
          isSuggestion
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
          >
            Suggest
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
