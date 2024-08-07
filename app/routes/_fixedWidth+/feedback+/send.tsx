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
} from "@remix-run/react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { authenticator, prisma } from "~/services";
import { feedbackFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Send feedback ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await feedbackFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.feedback.create({
    data: { ...result.data },
  });
  return redirectWithSuccess("/", "Much appreciated!");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/feedback",
  });
  return null;
}

export default function FeedbackSend() {
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  return (
    <Form method="post">
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Send me your feedback
        </h1>
        <p className="text-lg sm:text-xl">
          What you see here is very much a <em>work in progress</em>. Bearing
          that in mind:
        </p>
        <p className="text-lg sm:text-xl">
          Would you want to share any feedback with me? Which features would you
          like to be added first? Or is there anything that doesn&apos;t make
          sense to you?
        </p>
        <p className="text-lg sm:text-xl">
          Anything constructive is welcome. Make it anonymous, sign it, up to
          you. I&apos;m all ears 🙏
        </p>
        <hr className="my-8 border-amber-600" />
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <label className="grid gap-2 sm:col-span-1">
            <div>
              Name <span className="text-amber-600">(optional)</span>
            </div>
            <input
              autoComplete="on"
              type="text"
              name="name"
              className="w-full rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors.name && (
              <p className="text-red-600">
                {errors.fieldErrors.name.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2 sm:col-span-1">
            <div>
              Contact info <span className="text-amber-600">(optional)</span>
            </div>
            <input
              autoComplete="off"
              type="text"
              name="contact"
              className="w-full rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors.contact && (
              <p className="text-red-600">
                {errors.fieldErrors.contact.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2 sm:col-span-2">
            Your feedback
            <textarea
              autoComplete="off"
              name="content"
              className="min-h-20 w-full rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors.content && (
              <p className="text-red-600">
                {errors.fieldErrors.content.join(", ")}
              </p>
            )}
          </label>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Send
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
