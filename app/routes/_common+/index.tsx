import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { EventListCard } from "~/components";
import { prisma } from "~/services";
import { getTodayDate, enumEventStatus } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "~ Seek Gathering ~" },
    { name: "description", content: "Seek and you shall find…" },
  ];
};

export async function loader() {
  const events = await prisma.event.findMany({
    orderBy: [{ dateStart: "asc" }],
    select: {
      country: true,
      dateEnd: true,
      dateStart: true,
      slug: true,
      title: true,
    },
    take: 3,
    where: {
      dateEnd: { gte: getTodayDate() },
      status: enumEventStatus.PUBLISHED,
    },
  });
  return { events };
}

export default function Index() {
  const { events } = useLoaderData<typeof loader>();
  return (
    <div className="grid gap-8">
      <h1 className="text-center text-3xl sm:text-4xl">
        Welcome to Seek Gathering
      </h1>
      <p className="text-center text-lg sm:text-xl">
        Born from a deep love for the global conscious community, this platform
        is your gateway to discovering and connecting with extraordinary
        gatherings, festivals, and events designed to uplift your spirit and
        propel you forward on your journey of self-discovery
      </p>
      <h2 className="text-center text-2xl sm:text-3xl">
        What&apos;s happening soon?
      </h2>
      <div className="grid gap-2">
        {events.map((event) => (
          <EventListCard
            key={event.slug}
            slug={event.slug}
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
          className="rounded-lg border border-transparent bg-amber-800 px-8 py-4 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Browse upcoming events
        </Link>
      </div>
    </div>
  );
}
