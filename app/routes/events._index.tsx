import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import prisma from "~/db";

export const meta: MetaFunction = () => {
  return [{ title: "All Events ~ Seek Gathering" }];
};

export async function loader() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, dateStart: true, dateEnd: true },
    orderBy: [{ dateStart: "asc" }],
  });
  return events;
}

export default function Events() {
  const events = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-4xl mb-8">All Events</h1>
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
        <Link to="/events/new">Add New Event</Link>
        <Link to="/">Back</Link>
      </div>
    </>
  );
}
