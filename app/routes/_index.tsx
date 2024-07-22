import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { EventListCard } from "~/components";
import { prisma } from "~/services";
import { getTodayDate } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "~ Seek Gathering ~" },
    { name: "description", content: "Seek and you shall find…" },
  ];
};

export async function loader() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      dateStart: true,
      dateEnd: true,
      country: true,
    },
    where: { dateEnd: { gte: getTodayDate() } },
    orderBy: [{ dateStart: "asc" }],
    take: 3,
  });
  return events;
}

export default function Index() {
  const events = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="mb-8 text-center text-3xl sm:text-4xl">
        Welcome to Seek Gathering
      </h1>
      <p className="mb-8 text-center text-lg sm:mb-16 sm:text-xl">
        Born from a deep love for the global conscious community, this platform
        is your gateway to discovering and connecting with extraordinary
        gatherings, festivals, and events designed to uplift your spirit and
        propel you forward on your journey of self-discovery
      </p>
      <h2 className="mb-8 text-center text-2xl sm:text-3xl">
        What&apos;s happening soon?
      </h2>
      <div className="mb-8 grid gap-2">
        {events.map((event) => (
          <EventListCard
            key={event.id}
            id={event.id}
            title={event.title}
            country={event.country}
            dateStart={event.dateStart}
            dateEnd={event.dateEnd}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          to="/events"
          className="rounded-lg border border-transparent bg-amber-800 px-8 py-4 text-lg text-white hover:shadow-md active:shadow"
        >
          Show All Events
        </Link>
      </div>
    </>
  );
}
