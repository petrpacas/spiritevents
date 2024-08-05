import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, redirect, useActionData, useNavigate } from "@remix-run/react";
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
    return result.error.flatten();
  }
  await prisma.feedback.create({
    data: { ...result.data },
  });
  return redirect("/");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/feedback",
  });
  return null;
}

export default function SendFeedback() {
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();
  return (
    <Form method="post" className="grid gap-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Send me your feedback</h1>
      <p className="text-lg sm:text-xl">
        What you see here is just a hatchling, a prototype, an absolute work in
        progress. Bearing that in mind:
      </p>
      <p className="text-lg sm:text-xl">
        Would you want to share any feedback with me? What features would you
        like to be added first? Or is there anything that doesn&apos;t make
        sense to you?
      </p>
      <p className="text-lg sm:text-xl">
        Anything constructive is welcome. Anonymous, signed, everything goes
        here. Thank you for sharing 🙏
      </p>
      <hr className="border-amber-600" />
      <p className="text-center text-lg font-semibold sm:text-xl">
        Let&apos;s build this portal together!
      </p>
      <hr className="border-amber-600" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <div>
            Name <span className="text-amber-600">(optional)</span>
          </div>
          <input
            type="text"
            name="name"
            className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors.name && (
            <p className="text-red-600">{errors.fieldErrors.name.join(", ")}</p>
          )}
        </label>
        <label className="grid gap-2">
          <div>
            Contact info <span className="text-amber-600">(optional)</span>
          </div>
          <input
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
        <label className="grid gap-2 sm:col-span-2">
          Your feedback
          <textarea
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
          className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Send feedback
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
