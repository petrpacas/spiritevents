import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { EventListCard } from "~/components";
import bgImage from "~/images/elizabeth-anura_medicine-festival-2023-watermark.jpg";
import { prisma } from "~/services";
import { getTodayDate, EventStatus } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "SeekGathering ~ All the magic, all in one place" },
    {
      name: "description",
      content:
        "Reunite with your tribe and discover events and festivals focused on healing and truly being",
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
      id: true,
      location: true,
      slug: true,
      timeEnd: true,
      timeStart: true,
      title: true,
      categories: { orderBy: { name: "asc" } },
    },
    take: 3,
    where: {
      country: { equals: "CZ" },
      dateEnd: { gte: getTodayDate() },
      status: EventStatus.PUBLISHED,
    },
  });
  const festivals = await prisma.event.findMany({
    orderBy: [{ dateStart: "asc" }, { title: "asc" }],
    select: {
      country: true,
      dateEnd: true,
      dateStart: true,
      id: true,
      location: true,
      slug: true,
      timeEnd: true,
      timeStart: true,
      title: true,
      categories: { orderBy: { name: "asc" } },
    },
    take: 3,
    where: {
      dateEnd: { gte: getTodayDate() },
      categories: { some: { slug: { equals: "festival" } } },
      status: EventStatus.PUBLISHED,
    },
  });
  return { events, festivals };
}

export default function Landing() {
  const { events, festivals } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="relative grid min-h-lvh">
        <img
          src={bgImage}
          alt="Elizabeth Anura - Medicine Festival 2023"
          className="absolute left-0 top-0 h-full w-full object-cover"
        />
        <div className="relative grid min-h-lvh items-center justify-center bg-[linear-gradient(rgba(255,251,235,1),rgba(255,251,235,.8),rgba(255,251,235,1))]">
          <h2 className="max-w-7xl px-4 py-[6.625rem] text-center text-[1.875rem] font-bold leading-relaxed drop-shadow-[0_0_1.875rem_rgb(254,243,199)] min-[375px]:text-[2rem] min-[375px]:leading-relaxed min-[375px]:drop-shadow-[0_0_2rem_rgb(254,243,199)] min-[414px]:text-4xl min-[414px]:leading-relaxed min-[414px]:drop-shadow-[0_0_2.25rem_rgb(254,243,199)] sm:px-8 md:text-5xl md:leading-relaxed md:drop-shadow-[0_0_3rem_rgb(254,243,199)]">
            Reunite with your <strong className="text-amber-600">tribe</strong>{" "}
            <br className="max-lg:hidden" /> and discover{" "}
            <strong className="text-amber-600">events and festivals</strong>{" "}
            <br className="max-lg:hidden" /> focused on{" "}
            <strong className="text-amber-600">healing</strong> and truly{" "}
            <strong className="text-amber-600">being</strong>
          </h2>
        </div>
      </div>
      {(events.length > 0 || festivals.length > 0) && (
        <div className="bg-transparent">
          {events.length > 0 && (
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-8 sm:py-16">
              <h2 className="text-2xl sm:text-3xl">
                🔎 Discover <strong>soulful events</strong> taking place in{" "}
                <strong>Czech Republic</strong>
              </h2>
              <div className="grid gap-4">
                {events.map((event) => (
                  <EventListCard
                    eventsIndexFiltersCountry
                    key={event.id}
                    categories={event.categories}
                    country={event.country}
                    location={event.location}
                    dateStart={event.dateStart}
                    dateEnd={event.dateEnd}
                    id={event.id}
                    slug={event.slug}
                    timeStart={event.timeStart}
                    timeEnd={event.timeEnd}
                    title={event.title}
                  />
                ))}
              </div>
              <div className="grid items-center gap-8 sm:max-xl:flex sm:max-xl:justify-between xl:grid-cols-3 xl:gap-16">
                <p className="text-lg md:text-xl xl:col-span-2">
                  and many more&hellip;
                </p>
                <Link
                  to="/events?country=CZ"
                  className="flex items-center justify-center gap-3 rounded-lg border border-transparent bg-amber-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:col-start-3 sm:max-xl:justify-self-end lg:self-center"
                >
                  Discover events in Czechia
                  <svg
                    className="h-6 w-6 max-[339px]:hidden"
                    width="16px"
                    height="16px"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
          {events.length > 0 && festivals.length > 0 && (
            <div className="border-t border-amber-600" />
          )}
          {festivals.length > 0 && (
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-8 sm:py-16">
              <h2 className="text-2xl sm:text-3xl">
                ✨ Or, get enchanted at <strong>healing festivals</strong> all
                around the <strong>world</strong>
              </h2>
              <div className="grid gap-4">
                {festivals.map((event) => (
                  <EventListCard
                    key={event.id}
                    categories={event.categories}
                    country={event.country}
                    location={event.location}
                    dateStart={event.dateStart}
                    dateEnd={event.dateEnd}
                    id={event.id}
                    slug={event.slug}
                    timeStart={event.timeStart}
                    timeEnd={event.timeEnd}
                    title={event.title}
                  />
                ))}
              </div>
              <div className="grid items-center gap-8 sm:max-xl:flex sm:max-xl:justify-between xl:grid-cols-3 xl:gap-16">
                <p className="text-lg md:text-xl xl:col-span-2">
                  and more still&hellip;
                </p>
                <Link
                  to="/events?category=festival"
                  className="flex items-center justify-center gap-3 rounded-lg border border-amber-600 bg-transparent px-4 py-2 text-lg text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:col-start-3 sm:max-xl:justify-self-end lg:self-center"
                >
                  Discover all the festivals
                  <svg
                    className="h-6 w-6 max-[339px]:hidden"
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
                      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="grid gap-8 pb-8 sm:gap-16 sm:pb-16">
        <div className="bg-amber-100">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:gap-16 sm:px-8 sm:py-16 xl:grid-cols-2">
            <div className="grid gap-4 text-center sm:gap-8">
              <div className="text-4xl">🧿</div>
              <h2 className="text-3xl sm:text-4xl">
                All the <strong>magic</strong>,
                <br className="min-[490px]:hidden" /> all in{" "}
                <strong>one place</strong>
              </h2>
              <div className="grid text-lg italic leading-loose max-[499px]:gap-4 sm:text-xl sm:leading-loose">
                <p>The community, the connections, the people.</p>
                <p>The arts, the movement, the experiences.</p>
                <p>The wisdom, the insights, the growth.</p>
              </div>
              <div className="self-end border-y border-amber-600 py-4 text-lg italic max-xl:-mx-8 sm:px-4 sm:py-8 sm:text-xl">
                The ancient. The indigenous. The modern.
              </div>
            </div>
            <div className="grid gap-4 text-lg sm:gap-8 sm:text-xl">
              <p>
                We each have our own reasons why we love attending such events.
                We all come from different places, literally and figuratively.
                In these gatherings though we quickly realize that indeed{" "}
                <strong>we are all related</strong>.
              </p>
              <p>
                If you were to <em>search for your next opportunity</em> to{" "}
                <strong>gather with your tribe again</strong>, where would you
                look? The informations are scattered and hard to come by without
                having the right connections in real life or on social media.
              </p>
              <p>
                It&apos;s not easy to <strong>stay informed</strong> about{" "}
                what&apos;s happening where and when.
              </p>
              <p>
                <span className="font-bold">
                  <span className="text-amber-600">Seek</span>Gathering
                </span>{" "}
                aims to change it.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-100">
          <div className="mx-auto grid w-full max-w-7xl px-4 py-8 max-xl:gap-8 sm:px-8 sm:py-16 xl:grid-cols-3 xl:gap-16">
            <div className="grid gap-8 xl:col-span-2">
              <h3 className="text-2xl sm:text-3xl">
                🌀 Let&apos;s make this place a true portal{" "}
                <strong>together</strong>
              </h3>
              <div className="grid gap-4 text-lg sm:text-xl">
                <p>
                  Here&apos;s the deal:{" "}
                  <em>I&apos;m just one guy and I need your help.</em>
                </p>
                <p>
                  Do you know of any relevant event that deserves to be found by
                  like-minded people?
                </p>
                <p>
                  Suggesting it will not only support the event, but also all
                  the other seekers.
                </p>
              </div>
            </div>
            <Link
              to="/events/suggest"
              className="flex items-center justify-center gap-3 rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end xl:self-center"
            >
              Suggest a new event
              <svg
                className="h-6 w-6 max-[339px]:hidden"
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
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="bg-sky-100">
          <div className="mx-auto grid w-full max-w-7xl px-4 py-8 max-xl:gap-8 sm:px-8 sm:py-16 xl:grid-cols-3 xl:gap-16">
            <div className="grid gap-8 xl:col-span-2">
              <h3 className="text-2xl sm:text-3xl">
                🚧 Share your <strong>thoughts</strong>
              </h3>
              <div className="grid gap-4 text-lg sm:text-xl">
                <p>
                  What you see here is very much a <em>work in progress</em>.
                  Bearing that in mind:
                </p>
                <p>
                  Would you want to share any feedback with me? Which features
                  would you like to be added first? Or is there anything that
                  doesn&apos;t make sense to you?
                </p>
              </div>
            </div>
            <Link
              to="/feedback/send"
              className="flex items-center justify-center gap-3 rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end xl:self-center"
            >
              Send me your feedback
              <svg
                className="h-6 w-6 max-[339px]:hidden"
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
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
