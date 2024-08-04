import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { EventListCard, Footer, Header } from "~/components";
import { authenticator, prisma } from "~/services";
import { getTodayDate, enumEventStatus } from "~/utils";

// GET PERMISSION
import bgImage from "./elizabeth-anura_medicine-festival-2023-watermark.jpg";
// import bgImage from "./phoebe-montague_medicine-festival-2023-watermark.jpg";
// GET PERMISSION

export const meta: MetaFunction = () => {
  return [
    { title: "SeekGathering" },
    {
      name: "description",
      content:
        "Your gateway to discovering conscious gatherings and festivals intended to nourish, uplift, and connect…",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
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
  return { events, isAuthenticated: !!user };
}

export default function Index() {
  const { events, isAuthenticated } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="grid gap-8">
      <Header isAuthenticated={isAuthenticated} isLanding key={pathname} />
      <div
        className="grid min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="grid min-h-screen items-center justify-center bg-[linear-gradient(rgba(255,251,235,1),rgba(255,251,235,0.8),rgba(255,251,235,0.8),rgba(255,251,235,1))]">
          <h2 className="px-4 py-[6.625rem] text-center text-3xl font-bold leading-loose drop-shadow-[0_0_1rem_rgba(255,255,255,1)] sm:px-8 md:text-4xl md:leading-loose">
            Your gateway to discovering conscious{" "}
            <br className="max-lg:hidden" />
            <strong className="text-amber-600">
              gatherings and festivals
            </strong>{" "}
            intended to <br className="max-lg:hidden" />
            <strong className="text-amber-600">
              nourish, uplift, and connect
            </strong>
            &hellip;
          </h2>
        </div>
      </div>
      <main className="grid gap-8">
        <div className="bg-white">
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

        <div className="bg-emerald-50">
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
                    Help the event and help others: Send a suggestion for it to
                    be listed here!
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

        {/* <div className="bg-sky-50">
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
                to="/feedback"
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:px-8 sm:py-4 sm:max-xl:justify-self-end xl:self-center"
              >
                Give me your feedback
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div> */}
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
