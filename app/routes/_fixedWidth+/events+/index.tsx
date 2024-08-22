import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Prisma } from "@prisma/client";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { CountrySelect, EventListCard } from "~/components";
import { authenticator, prisma } from "~/services";
import { countries, getTodayDate, EventStatus } from "~/utils";

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
  const search = requestUrl.searchParams.get("search");
  const allEventCountries = await prisma.event.groupBy({
    by: "country",
    where: {
      dateEnd: user ? undefined : { gte: getTodayDate() },
      status: user ? undefined : EventStatus.PUBLISHED,
    },
  });
  type EventObject = {
    country: string;
    dateEnd: string;
    dateStart: string;
    slug: string;
    status: EventStatus;
    title: string;
  };
  let allEvents: EventObject[];
  if (search) {
    const searchTerms = search
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter((term) => term.length > 0);
    const whereClauses = searchTerms.map((term) => {
      return Prisma.sql`unaccent(LOWER(title)) LIKE unaccent(LOWER(${`%${term}%`}))`;
    });
    allEvents = await prisma.$queryRaw`
      SELECT "country", "dateEnd", "dateStart", "slug", "status", "title"
      FROM "Event"
      WHERE
        (${country ? Prisma.sql`country = ${country}` : Prisma.sql`TRUE`})
        AND (${user ? Prisma.sql`TRUE` : Prisma.sql`"dateEnd" >= ${getTodayDate()}`})
        AND (${Prisma.join(whereClauses, " AND ")})
        AND (${
          user
            ? Prisma.sql`TRUE`
            : Prisma.sql`"status" = ${Prisma.raw(`'${EventStatus.PUBLISHED}'::"EventStatus"`)}`
        })
      ORDER BY "dateStart" ASC, "title" ASC
    `;
  } else {
    allEvents = await prisma.event.findMany({
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
        status: user ? undefined : EventStatus.PUBLISHED,
      },
      orderBy: [{ dateStart: "asc" }, { title: "asc" }],
    });
  }
  return {
    allEventCountries,
    allEvents,
    country,
    isAuthenticated: !!user,
    search,
  };
}

export default function Events() {
  const { allEventCountries, allEvents, country, isAuthenticated, search } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isWorking = navigation.state !== "idle";
  const submit = useSubmit();
  const [isFiltering, setIsFiltering] = useState(false);
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
  const handleFiltering = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    if (formData.get("search") === "") {
      formData.delete("search");
    }
    if (formData.get("country") === "") {
      formData.delete("country");
    }
    submit(formData, { preventScrollReset: true });
  };
  const handleCountryFiltering = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.currentTarget.form) {
      debouncedTitleFiltering.cancel();
      handleFiltering(e.currentTarget.form);
    }
  };
  const handleTitleFiltering = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.form) {
      handleFiltering(e.target.form);
    }
  };
  const debouncedTitleFiltering = useDebouncedCallback(
    handleTitleFiltering,
    1000,
  );
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debouncedTitleFiltering.cancel();
    handleFiltering(e.currentTarget);
  };
  const clearTitleFiltering = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (e.currentTarget.form) {
      const formData = new FormData(e.currentTarget.form);
      formData.delete("search");
      if (formData.get("country") === "") {
        formData.delete("country");
      }
      const searchEl = document.getElementById("search");
      if (searchEl instanceof HTMLInputElement) {
        searchEl.focus();
      }
      submit(formData, { preventScrollReset: true });
    }
  };
  useEffect(() => {
    if (!isWorking) {
      setIsFiltering(false);
    }
  }, [isWorking]);
  useEffect(() => {
    const countryEl = document.getElementById("country");
    const searchEl = document.getElementById("search");
    if (countryEl instanceof HTMLSelectElement) {
      countryEl.value = country || "";
    }
    if (searchEl instanceof HTMLInputElement) {
      searchEl.value = search || "";
    }
  }, [country, search]);
  return (
    <div className="grid gap-8">
      <div className="grid items-center gap-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-relaxed sm:text-4xl sm:leading-relaxed">
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
        {!(isAuthenticated || country || search) && (
          <p className="text-lg sm:text-xl">
            Browse through the myriad of nourishing festivals and gatherings so
            you can get informed and inspired. And if you don&apos;t see the one
            you know and love - or perhaps the one you wish to attend for the
            first time - send me a{" "}
            <Link to="/events/suggest" className="text-amber-600 underline">
              suggestion
            </Link>
            !
          </p>
        )}
        {(search || allEvents.length > 0) && (
          <Form
            onChange={() => setIsFiltering(true)}
            onSubmit={handleFormSubmit}
            className="grid gap-4 border-y border-amber-600 py-8 sm:flex sm:py-4"
          >
            {countryObjects.length > 1 && (
              <label
                className="grid items-center gap-2 md:flex"
                htmlFor="country"
              >
                Showing events in
                <CountrySelect
                  onChange={handleCountryFiltering}
                  countries={countryObjects}
                  defaultValue={country || ""}
                  className="rounded border border-stone-300 py-2 font-bold shadow-sm transition-shadow hover:shadow-md active:shadow"
                />
              </label>
            )}
            <label className="grid items-center gap-2 sm:flex-1 md:flex">
              <span className="flex-shrink">Search title</span>
              <div className="flex flex-grow gap-2">
                <input
                  onChange={debouncedTitleFiltering}
                  autoComplete="off"
                  type="text"
                  name="search"
                  id="search"
                  defaultValue={search || ""}
                  className="flex-grow rounded border border-stone-300 py-2 font-bold placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow"
                />
                {isFiltering ? (
                  <div className="flex-shrink self-center">
                    <svg
                      className="h-6 w-6 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#5b7280"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </div>
                ) : (
                  search && (
                    <button
                      className="flex-shrink"
                      type="button"
                      onClick={clearTitleFiltering}
                    >
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#5b7280"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )
                )}
              </div>
            </label>
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
        <p className="my-4 justify-self-center border-y border-amber-600 py-4 text-xl italic sm:my-8 sm:px-4 sm:py-8 sm:text-2xl">
          {search ? "No events found…" : "No events yet…"}
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
