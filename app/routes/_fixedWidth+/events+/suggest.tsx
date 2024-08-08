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
  return redirectWithSuccess("/events", "Noted!");
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
          Here&apos;s the deal:{" "}
          <em>I&apos;m just one guy and I need your help.</em>
        </p>
        <p className="text-lg sm:text-xl">
          Do you know of any relevant festival that deserves to be found by
          like-minded people from around the world?
        </p>
        <p className="text-lg text-amber-600 sm:text-xl">
          Suggesting it will not only support the event, but also all the other
          seekers.
        </p>
        <p className="text-lg sm:text-xl">
          If you choose to send a suggestion, I&apos;d like to kindly ask you to
          fill the form below with the event title, country, and the dates.{" "}
          <strong>You have my deepest thanks if you do it!</strong>
        </p>
        <p className="text-lg sm:text-xl">
          If you want to contribute but don&apos;t want to fiddle with the form,
          no worries, go ahead and just reach out through the contacts{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              const el = document.getElementById("contacts");
              if (el)
                el.scrollIntoView({
                  behavior: "auto",
                  block: "start",
                  inline: "center",
                });
            }}
          >
            in the footer
          </button>
          . Everything counts.
        </p>
        <div className="my-8 border-y border-amber-600 py-8 text-center text-lg font-semibold sm:px-4 sm:text-xl">
          Let&apos;s make this place a true portal together 🌀
        </div>
        <EventFormFields
          errors={errors}
          mdxEditorRef={mdxEditorRef}
          isSuggestion
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Suggest
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
