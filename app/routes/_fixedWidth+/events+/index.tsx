import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { CountrySelect, EventListCard } from "~/components";
import { authenticator, prisma } from "~/services";
import { countries, getTodayDate, enumEventStatus } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title:
        (data?.isAuthenticated ? "All events" : "Upcoming events") +
        " ~ SeekGathering",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const user = await authenticator.isAuthenticated(request);
  const country = requestUrl.searchParams.get("country");
  const allEventCountries = await prisma.event.groupBy({
    by: "country",
    where: {
      dateEnd: user ? undefined : { gte: getTodayDate() },
      status: user ? undefined : enumEventStatus.PUBLISHED,
    },
  });
  const allEvents = await prisma.event.findMany({
    orderBy: [{ dateStart: "asc" }, { title: "asc" }],
    select: {
      country: true,
      dateEnd: true,
      dateStart: true,
      slug: true,
      status: true,
      title: true,
    },
    where: {
      country: country || undefined,
      dateEnd: user ? undefined : { gte: getTodayDate() },
      status: user ? undefined : enumEventStatus.PUBLISHED,
    },
  });
  return { allEventCountries, allEvents, country, isAuthenticated: !!user };
}

export default function Events() {
  const { allEventCountries, allEvents, country, isAuthenticated } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isWorking = navigation.state !== "idle";
  const submit = useSubmit();
  const getCountryObjects = (countryCodes: string[]) => {
    return countries.filter((c) => countryCodes.includes(c.code));
  };
  const allCountryCodes = allEventCountries.map((e) => e.country);
  const countryObjects = getCountryObjects(allCountryCodes);
  type EventsWithYear = {
    year: string;
    events: typeof allEvents;
  };
  function groupEventsByYear(events: typeof allEvents): EventsWithYear[] {
    const groupedEvents: Record<string, typeof allEvents> = {};
    for (const event of events) {
      const year =
        event.dateStart === ""
          ? "0"
          : new Date(event.dateStart).getFullYear().toString();
      if (!groupedEvents[year]) {
        groupedEvents[year] = [];
      }
      groupedEvents[year].push(event);
    }
    const result: EventsWithYear[] = [];
    for (const year in groupedEvents) {
      result.push({
        year,
        events: groupedEvents[year],
      });
    }
    return result;
  }
  const eventsByYear = groupEventsByYear(allEvents);
  const handleCountryChange = (e: React.FormEvent<HTMLFormElement>) => {
    const $form = e.currentTarget;
    const formData = new FormData($form);
    if (formData.get("country") === "") {
      formData.delete("country");
    }
    submit(formData, { preventScrollReset: true });
  };
  return (
    <div className="grid gap-8">
      <div className="grid items-center gap-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold sm:text-4xl">
          <svg
            className="h-8 w-8 text-amber-600 max-[452px]:hidden sm:h-10 sm:w-10"
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
          <span>{isAuthenticated ? "All events" : "Upcoming events"}</span>
        </h1>
        <p className="text-lg sm:text-xl lg:col-span-2 lg:row-start-2">
          Browse through the myriad of nourishing festivals and gatherings so
          you can get informed and inspired. And if you don&apos;t see the one
          you know and love - or perhaps the one you wish to attend for the
          first time - send me a{" "}
          <Link to="/events/suggest" className="text-amber-600 underline">
            suggestion
          </Link>
          !
        </p>
        {allEvents.length > 0 && (
          <Form
            className="sm:flex sm:justify-end"
            onChange={handleCountryChange}
          >
            <fieldset disabled={isWorking}>
              <label
                className="grid items-center gap-2 sm:flex"
                htmlFor="country"
              >
                Showing events in
                <CountrySelect
                  countries={countryObjects}
                  defaultValue={country || undefined}
                  className="rounded border border-stone-300 py-1 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                />
              </label>
            </fieldset>
          </Form>
        )}
      </div>
      {allEvents.length > 0 ? (
        <div className="grid gap-8">
          {eventsByYear.map((group, index) => (
            <div className="grid gap-4" key={index}>
              <h2 className="text-2xl font-bold sm:text-3xl">
                {group.year === "0" ? "Missing date info" : group.year}
              </h2>
              {group.events.map((event) => (
                <EventListCard
                  key={event.slug}
                  slug={event.slug}
                  status={isAuthenticated ? event.status : undefined}
                  title={event.title}
                  country={event.country}
                  dateStart={event.dateStart}
                  dateEnd={event.dateEnd}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="justify-self-center border-y border-amber-600 py-4 text-xl italic max-sm:my-4 sm:px-4 sm:py-8 sm:text-2xl">
          No events yet&hellip;
        </p>
      )}
      {isAuthenticated ? (
        allEvents.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm max-[399px]:flex-col sm:gap-4 sm:text-base md:text-lg">
            <div className="rounded border border-amber-600 bg-emerald-100 p-2 sm:px-4">
              <span className="text-amber-600">(S)</span> Suggested
            </div>
            <div className="rounded border border-amber-600 bg-sky-100 p-2 sm:px-4">
              <span className="text-amber-600">(D)</span> Draft
            </div>
            <div className="rounded border border-amber-600 bg-white p-2 sm:px-4">
              Published
            </div>
          </div>
        )
      ) : (
        <div className="grid max-xl:gap-8 xl:grid-cols-3 xl:gap-16">
          <Link
            to="/events/suggest"
            className="flex items-center justify-center gap-4 rounded-lg border border-emerald-600 px-4 py-2 text-lg text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow sm:max-xl:justify-self-end xl:col-start-3"
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
