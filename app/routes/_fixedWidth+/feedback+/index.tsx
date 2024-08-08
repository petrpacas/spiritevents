import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { jsonWithSuccess } from "remix-toast";
import { prisma, requireUserSession } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "See feedback ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const id = data.id;
  if (typeof id === "string") {
    await prisma.feedback.delete({ where: { id } });
    return jsonWithSuccess("/events", "Feedback deleted");
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const allFeedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      contact: true,
      content: true,
      id: true,
      name: true,
    },
  });
  return { allFeedback };
}

export default function Feedback() {
  const fetcher = useFetcher();
  const { allFeedback } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const isWorking = fetcher.state !== "idle";
  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-bold sm:text-4xl">See feedback</h1>
      {allFeedback.length > 0 ? (
        <div className="grid gap-4">
          {allFeedback.map((feedback) => (
            <div
              className="grid gap-2 rounded-lg border border-stone-300 p-2 sm:gap-4 sm:p-4 md:grid-cols-2"
              key={feedback.id}
            >
              <div className="grid gap-2 self-start sm:gap-4">
                <div>
                  <span className="text-amber-600">CreatedAt:</span>{" "}
                  {new Date(feedback.createdAt).toUTCString()}
                </div>
                <div>
                  <span className="text-amber-600">Name:</span>{" "}
                  {feedback.name === "" ? (
                    <span className="text-stone-300">n/a</span>
                  ) : (
                    feedback.name
                  )}
                </div>
                <div>
                  <span className="text-amber-600">Contact:</span>{" "}
                  {feedback.contact === "" ? (
                    <span className="text-stone-300">n/a</span>
                  ) : (
                    feedback.contact
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:gap-4">
                <div className="self-start font-bold">
                  <span className="text-amber-600">Content:</span>{" "}
                  {feedback.content}
                </div>
                <fetcher.Form
                  method="post"
                  className="place-self-end"
                  onSubmit={(event) => {
                    const response = confirm(
                      "Do you really want to delete the event?",
                    );
                    if (!response) {
                      event.preventDefault();
                    }
                  }}
                >
                  <button
                    disabled={isWorking}
                    type="submit"
                    name="id"
                    value={feedback.id}
                    className="rounded border border-red-600 bg-white px-2 py-1 text-red-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                  >
                    Delete
                  </button>
                </fetcher.Form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="justify-self-center border-y border-amber-600 py-4 text-xl italic max-sm:my-4 sm:px-4 sm:py-8 sm:text-2xl">
          No feedback yet&hellip;
        </p>
      )}

      <div className="flex justify-end gap-4">
        <button
          disabled={isWorking}
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
