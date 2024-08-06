import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { prisma, requireUserSession } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "See feedback ~ SeekGathering" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const allFeedback = await prisma.feedback.findMany({
    orderBy: [{ createdAt: "desc" }],
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
  const { allFeedback } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-bold sm:text-4xl">See feedback</h1>
      <div className="grid gap-4 sm:gap-8">
        {allFeedback.length === 0 ? (
          <>
            <hr className="mt-8 border-amber-600" />
            <p className="text-center text-lg sm:text-xl">
              No feedback yet&hellip;
            </p>
            <hr className="mb-8 border-amber-600" />
          </>
        ) : (
          allFeedback.map((feedback) => (
            <div
              className="grid gap-2 rounded-lg border border-stone-300 p-2 sm:gap-4 sm:p-4 md:max-xl:grid-cols-2 xl:grid-cols-3"
              key={feedback.id}
            >
              <div className="md:max-xl:col-span-2">
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
              <div className="font-bold md:max-xl:col-span-2 xl:col-span-3">
                <span className="text-amber-600">Content:</span>{" "}
                {feedback.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Back
        </button>
      </div>
    </div>
  );
}
