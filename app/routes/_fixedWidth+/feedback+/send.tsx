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
import { Bot } from "grammy";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { authenticator, prisma } from "~/services";
import { feedbackFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Send me your feedback ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = feedbackFormSchema.safeParse(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.feedback.create({ data: result.data });
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    await bot.api.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      `New feedback: ${result.data.content}`,
    );
  }
  return redirectWithSuccess("/", "Noted!");
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
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
          <span>Send me your feedback</span>
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
          you. I&apos;m all ears!
        </p>
        <hr className="my-8 border-amber-600" />
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <label className="grid gap-2 md:col-span-1">
            <div>
              Name <span className="text-amber-600">(optional)</span>
            </div>
            <input
              autoComplete="on"
              type="text"
              name="name"
              className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors.name && (
              <p className="text-red-600">
                {errors.fieldErrors.name.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2 md:col-span-1">
            <div>
              Contact info <span className="text-amber-600">(optional)</span>
            </div>
            <input
              autoComplete="off"
              type="text"
              name="contact"
              className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors.contact && (
              <p className="text-red-600">
                {errors.fieldErrors.contact.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2 md:col-span-2">
            Your feedback
            <textarea
              autoComplete="off"
              name="content"
              className="min-h-20 rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
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
