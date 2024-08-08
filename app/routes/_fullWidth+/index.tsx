import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { EventListCard } from "~/components";
import { prisma } from "~/services";
import { getTodayDate, enumEventStatus } from "~/utils";

// GET PERMISSIONS
import bgImage from "~/images/elizabeth-anura_medicine-festival-2023-watermark.jpg";
// import bgImage from "~/images/phoebe-montague_medicine-festival-2023-watermark.jpg";

export const meta: MetaFunction = () => {
  return [
    { title: "SeekGathering ~ All the magic, all in one place" },
    {
      name: "description",
      content:
        "Reunite with your tribe and discover gatherings and festivals focused on healing and truly being",
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
          <h2 className="max-w-7xl px-4 py-[6.625rem] text-center text-[1.875rem] font-bold leading-relaxed drop-shadow-[0_0_1.875rem_rgb(254,243,199)] min-[375px]:text-[2rem] min-[375px]:leading-relaxed min-[375px]:drop-shadow-[0_0_2rem_rgb(254,243,199)] min-[414px]:text-4xl min-[414px]:leading-relaxed min-[414px]:drop-shadow-[0_0_2.25rem_rgb(254,243,199)] sm:px-8 sm:py-32 md:text-5xl md:leading-relaxed md:drop-shadow-[0_0_3rem_rgb(254,243,199)]">
            Reunite with your <strong className="text-amber-600">tribe</strong>{" "}
            <br className="max-lg:hidden" /> and discover{" "}
            <strong className="text-amber-600">gatherings and festivals</strong>{" "}
            <br className="max-lg:hidden" /> focused on{" "}
            <strong className="text-amber-600">healing</strong> and truly{" "}
            <strong className="text-amber-600">being</strong>
          </h2>
        </div>
      </div>

      <div className="bg-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:pb-24 sm:pt-32">
          <div className="mx-auto grid w-full max-w-4xl gap-8 text-center sm:gap-16">
            <h2 className="text-3xl sm:text-4xl">
              All the <strong>magic</strong>,
              <br className="min-[490px]:hidden" /> all in{" "}
              <strong>one place</strong>
            </h2>
            <div className="grid text-xl italic leading-relaxed max-[499px]:gap-4 sm:text-2xl sm:leading-relaxed">
              <p>The community, the connections, the people.</p>
              <p> The arts, the movement, the experiences. </p>
              <p> The wisdom, the insights, the growth.</p>
            </div>
            <p className="justify-self-center border-y border-amber-600 py-4 text-xl italic max-sm:my-4 sm:px-4 sm:py-8 sm:text-2xl">
              The ancient. The indigenous. The modern.
            </p>
            <div className="grid gap-8">
              <p className="text-lg sm:text-xl">
                We each have our own reasons why we love attending such events.
                We all come from different places, literally and figuratively.
                In these gatherings though we quickly realize that indeed{" "}
                <strong>we are all related</strong>.
              </p>
              <p className="text-lg sm:text-xl">
                If you were to search for your next opportunity to{" "}
                <span className="text-amber-600">enter the vortex</span> again,
                where would you look? The informations are scattered and hard to
                come by without having the right connections in real life or on
                social media.
              </p>
              <p className="text-lg sm:text-xl">
                It&apos;s <strong>not easy</strong> to stay informed about{" "}
                <strong>what&apos;s happening where and when</strong>.
              </p>
            </div>
            <p className="justify-self-center border-y border-amber-600 py-4 text-xl max-sm:my-4 sm:px-4 sm:py-8 sm:text-2xl">
              <span className="font-semibold">
                <span className="text-amber-600">Seek</span>Gathering
              </span>{" "}
              aims to change it.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 pb-8 sm:gap-16 sm:pb-16">
        <div className="bg-transparent">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-8 sm:py-16">
            <h2 className="text-2xl sm:text-3xl">
              📅 Choose from the myriad of nourishing{" "}
              <strong>festivals and gatherings</strong>
            </h2>
            <div className="grid gap-4">
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
            <div className="grid items-center gap-8 sm:max-xl:flex sm:max-xl:justify-between xl:grid-cols-3 xl:gap-16">
              <p className="text-xl sm:text-2xl xl:col-span-2">
                and many more&hellip;
              </p>
              <Link
                to="/events"
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-amber-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:col-start-3 sm:max-xl:justify-self-end lg:self-center"
              >
                Browse upcoming events
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
        </div>

        <div className="bg-emerald-100">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
            <div className="grid max-xl:gap-8 xl:grid-cols-3 xl:gap-16">
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
                    Do you know of any relevant festival that deserves to be
                    found by like-minded people from around the world?
                  </p>
                  <p>
                    Suggesting it will not only support the event, but also all
                    the other seekers.
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
        </div>

        <div className="bg-sky-100">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
            <div className="grid max-xl:gap-8 xl:grid-cols-3 xl:gap-16">
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
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end xl:self-center"
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
      </div>
    </>
  );
}
