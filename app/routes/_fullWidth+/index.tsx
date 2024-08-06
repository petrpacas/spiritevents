import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { EventListCard } from "~/components";
import { prisma } from "~/services";
import { getTodayDate, enumEventStatus } from "~/utils";

// GET PERMISSION
import bgImage from "~/images/elizabeth-anura_medicine-festival-2023-watermark.jpg";
// GET PERMISSION

export const meta: MetaFunction = () => {
  return [
    { title: "SeekGathering" },
    {
      name: "description",
      content:
        "Your gateway to discovering conscious gatherings and festivals intended to nourish, uplift, and connect",
    },
  ];
};

export async function loader() {
  const events = await prisma.event.findMany({
    orderBy: [{ dateStart: "asc" }, { title: "asc" }],
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

export default function Landing() {
  const { events } = useLoaderData<typeof loader>();
  return (
    <>
      <div
        className="grid min-h-lvh bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="grid min-h-lvh items-center justify-center bg-[linear-gradient(rgba(255,251,235,1),rgba(255,251,235,.8),rgba(255,251,235,1))]">
          <h2 className="max-w-7xl px-4 py-[6.625rem] text-center text-3xl font-bold leading-relaxed drop-shadow-[0_0_1.875rem_rgb(254,243,199)] sm:px-8 sm:py-32 sm:text-4xl sm:leading-relaxed sm:drop-shadow-[0_0_2.25rem_rgb(254,243,199)] md:text-5xl md:leading-relaxed md:drop-shadow-[0_0_3rem_rgb(254,243,199)]">
            Your gateway to discovering conscious{" "}
            <br className="max-lg:hidden" />
            <strong className="text-amber-600">
              gatherings and festivals
            </strong>{" "}
            intended to <br className="max-lg:hidden" />
            <strong className="text-amber-600">
              nourish, uplift, and connect
            </strong>
          </h2>
        </div>
      </div>
      <div className="grid gap-8 py-8 sm:gap-16 sm:py-16">
        <div className="bg-transparent">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-8 sm:py-16">
            <h2 className="text-2xl sm:text-3xl">
              📅 Choose from the myriad of extraordinary{" "}
              <strong>gatherings</strong>
            </h2>
            <div className="grid gap-2 sm:gap-4">
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
            <div className="grid gap-8 xl:grid-cols-3 xl:gap-16">
              <Link
                to="/events"
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-amber-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end lg:self-center xl:col-start-3"
              >
                Browse upcoming events
                <svg
                  className="h-6 w-6 max-[339px]:hidden"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-emerald-100">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
            <div className="grid max-xl:gap-8 xl:grid-cols-3 xl:gap-16">
              <div className="grid gap-8 xl:col-span-2">
                <h2 className="text-2xl sm:text-3xl">
                  🌀 Let&apos;s make this place a true portal{" "}
                  <strong>together</strong>
                </h2>
                <div className="grid gap-4 text-lg sm:text-xl">
                  <p>
                    Do you know of any conscious festival that deserves to be
                    known and found by like-minded people from around the world?
                  </p>
                  <p>
                    Suggesting it will support not only the event but also other
                    seekers.
                  </p>
                </div>
              </div>
              <Link
                to="/events/suggest"
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end xl:self-center"
              >
                Suggest a new event
                <svg
                  className="h-6 w-6 max-[339px]:hidden"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-sky-100">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
            <div className="grid max-xl:gap-8 xl:grid-cols-3 xl:gap-16">
              <div className="grid gap-8 xl:col-span-2">
                <h2 className="text-2xl sm:text-3xl">
                  🚧 Share your <strong>thoughts</strong>
                </h2>
                <div className="grid gap-4 text-lg sm:text-xl">
                  <p>
                    What you see here is just a hatchling, a prototype, an
                    absolute work in progress. Bearing that in mind:
                  </p>
                  <p>
                    Would you want to share any feedback with me? What features
                    would you like to be added first? Or is there anything that
                    doesn&apos;t make sense to you?
                  </p>
                </div>
              </div>
              <Link
                to="/feedback/send"
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end xl:self-center"
              >
                Send me your feedback
                <svg
                  className="h-6 w-6 max-[339px]:hidden"
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
