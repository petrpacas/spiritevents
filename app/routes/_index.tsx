import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import prisma from "~/services/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "~ Seek Gathering ~" },
    { name: "description", content: "Seek and you shall find…" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const events = await prisma.event.findMany({
    select: { id: true, title: true, dateStart: true, dateEnd: true },
    orderBy: [{ dateStart: "asc" }],
    take: 3,
  });
  return { user, events };
}

export default function Index() {
  const { user, events } = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-4xl mb-8">~ Seek Gathering ~</h1>
      <p className="text-xl mb-8">
        Out of love for the community, a seeker&apos;s aid was born&hellip;
      </p>
      <h2 className="text-3xl mb-8">What&apos;s happening soon?</h2>
      <div className="flex flex-col gap-2 mb-8">
        {events.map((event) => (
          <Link
            key={event.id}
            className="text-2xl flex items-center justify-between"
            to={`/events/${event.id}`}
          >
            <span>{event.title || "n/a"}</span>
            <span className="text-base flex gap-4">
              <span>{event.dateStart}</span>
              {event.dateEnd && (
                <>
                  <span className="text-slate-400">&gt;&gt;</span>
                  <span>{event.dateEnd}</span>
                </>
              )}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <Link to="/events">Show All Events</Link>
        {user ? (
          <Form action="/logout" method="post">
            <button type="submit">Log Out</button>
          </Form>
        ) : (
          <Link to="/login">Log In</Link>
        )}
      </div>
    </>
  );
}
