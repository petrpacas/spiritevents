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
import { EventListCard, Select } from "~/components";
import { authenticator, prisma } from "~/services";
import { countries, getTodayDate, EventStatus } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title:
        (data?.isAuthenticated ? "All events" : "Discover events") +
        " ~ SeekGathering",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const user = await authenticator.isAuthenticated(request);
  const country = requestUrl.searchParams.get("country");
  const past = requestUrl.searchParams.get("past");
  const search = requestUrl.searchParams.get("search");
  const status = requestUrl.searchParams.get("status");
  const isAuthenticated = Boolean(user);
  const isPast = past === "true";
  const today = getTodayDate();
  type EventObject = {
    country: string;
    dateEnd: string;
    dateStart: string;
    id: string;
    location: string;
    slug: string;
    status: EventStatus;
    timeEnd: string;
    timeStart: string;
    title: string;
  };
  type EventsWithMonth = {
    month: string;
    events: EventObject[];
  };
  type EventsWithYear = {
    year: string;
    months: EventsWithMonth[];
  };
  let eventStatusEnumMatch = undefined;
  switch (status) {
    case "suggested":
      eventStatusEnumMatch = EventStatus.SUGGESTED;
      break;
    case "draft":
      eventStatusEnumMatch = EventStatus.DRAFT;
      break;
    case "published":
      eventStatusEnumMatch = EventStatus.PUBLISHED;
      break;
    default:
      break;
  }
  const allCountries = await prisma.event.groupBy({
    by: ["country"],
    where: {
      OR: [
        { dateEnd: isPast ? { lt: today, not: "" } : { gte: today } },
        { dateEnd: isAuthenticated ? "" : undefined },
      ],
      status: isAuthenticated
        ? status && eventStatusEnumMatch
          ? eventStatusEnumMatch
          : undefined
        : EventStatus.PUBLISHED,
    },
  });
  const allCountryCodes = allCountries
    .map((c) => c.country)
    .sort((a, b) => {
      if (a === "CZ") return -1;
      if (b === "CZ") return 1;
      return a.localeCompare(b);
    });
  const searchConditions =
    search
      ?.trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter((term) => term.length > 0)
      .map(
        (term) =>
          Prisma.sql`unaccent(LOWER(title)) LIKE unaccent(LOWER(${`%${term}%`}))`,
      ) || [];
  const allEvents: EventObject[] = await prisma.$queryRaw`
    SELECT
      "country",
      "dateEnd",
      "dateStart",
      "id",
      "location",
      "slug",
      "status",
      "timeEnd",
      "timeStart",
      "title"
    FROM "Event"
    WHERE
      ${country ? Prisma.sql`country = ${country}` : Prisma.sql`TRUE`}
      AND (
        ${
          isAuthenticated
            ? status && eventStatusEnumMatch
              ? Prisma.sql`"status" = ${Prisma.raw(`'${eventStatusEnumMatch}'`)} `
              : Prisma.sql`TRUE`
            : Prisma.sql`"status" = ${Prisma.raw(`'${EventStatus.PUBLISHED}'`)} `
        })
      AND (
        ${
          isPast
            ? Prisma.sql`"dateEnd" < ${today} AND "dateEnd" != ''`
            : Prisma.sql`"dateEnd" >= ${today}`
        }
        ${isAuthenticated ? Prisma.sql`OR "dateEnd" = ''` : Prisma.sql``}
      )
      ${
        searchConditions.length > 0
          ? Prisma.sql`AND (${Prisma.join(searchConditions, " AND ")})`
          : Prisma.sql``
      }
    ORDER BY
      "dateStart" ${isPast ? Prisma.sql`DESC` : Prisma.sql`ASC`},
      "title" ASC
  `;
  function groupEvents(events: EventObject[]): EventsWithYear[] {
    const groupedEvents: Record<string, Record<string, EventObject[]>> = {};
    events.forEach((event) => {
      const date = new Date(event.dateStart);
      const year =
        event.dateStart === ""
          ? "0"
          : date.getFullYear().toString().padStart(4, "0");
      const month =
        event.dateStart === ""
          ? "0"
          : (date.getMonth() + 1).toString().padStart(2, "0");
      if (!groupedEvents[year]) {
        groupedEvents[year] = {};
      }
      if (!groupedEvents[year][month]) {
        groupedEvents[year][month] = [];
      }
      groupedEvents[year][month].push(event);
    });
    return Object.entries(groupedEvents).map(([year, months]) => ({
      year,
      months: Object.entries(months).map(([month, events]) => ({
        month,
        events,
      })),
    }));
  }
  const groupedEvents = groupEvents(allEvents);
  return {
    allCountryCodes,
    country,
    groupedEvents,
    isAuthenticated,
    past,
    search,
    status,
  };
}

export default function Events() {
  const {
    allCountryCodes,
    country,
    groupedEvents,
    isAuthenticated,
    past,
    search,
    status,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isWorking = navigation.state !== "idle";
  const submit = useSubmit();
  const [isFiltering, setIsFiltering] = useState(false);
  const hasGroupedEvents = groupedEvents.length > 0;
  const getCountryObjects = (countryCodes: string[]) => {
    return countries.filter((c) => countryCodes.includes(c.code));
  };
  const countryObjects = getCountryObjects(allCountryCodes);
  const handleFiltering = (
    form: HTMLFormElement,
    preserveCountry?: boolean,
  ) => {
    const formData = new FormData(form);
    if (formData.get("status") === "") {
      formData.delete("status");
    }
    if (formData.get("past") === "") {
      formData.delete("past");
    }
    if (formData.get("country") === "" || !preserveCountry) {
      formData.delete("country");
    }
    if (formData.get("search") === "") {
      formData.delete("search");
    }
    submit(formData, { preventScrollReset: true });
  };
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    preserveCountry?: boolean,
  ) => {
    if (e.currentTarget.form) {
      debouncedHandleSearchChange.cancel();
      handleFiltering(e.currentTarget.form, preserveCountry);
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.form) {
      handleFiltering(e.target.form, true);
    }
  };
  const debouncedHandleSearchChange = useDebouncedCallback(
    handleSearchChange,
    1000,
  );
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debouncedHandleSearchChange.cancel();
    handleFiltering(e.currentTarget, true);
  };
  const handleClearSearch = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (e.currentTarget.form) {
      const formData = new FormData(e.currentTarget.form);
      if (formData.get("past") === "") {
        formData.delete("past");
      }
      if (formData.get("country") === "") {
        formData.delete("country");
      }
      formData.delete("search");
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
    const statusEl = document.getElementById("status");
    const pastEl = document.getElementById("past");
    const countryEl = document.getElementById("country");
    const searchEl = document.getElementById("search");
    if (statusEl instanceof HTMLSelectElement) {
      statusEl.value = status || "";
    }
    if (pastEl instanceof HTMLSelectElement) {
      pastEl.value = past || "";
    }
    if (countryEl instanceof HTMLSelectElement) {
      countryEl.value = country || "";
    }
    if (searchEl instanceof HTMLInputElement) {
      searchEl.value = search || "";
    }
  }, [status, past, country, search]);
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
          <span>
            {isAuthenticated ? "All events" : "Discover uplifting events"}
          </span>
        </h1>
        {!(country || isAuthenticated || past || search) && (
          <p className="text-lg sm:text-xl">
            Browse through the myriad of nourishing events and festivals to get
            informed and inspired. And if you know of a gathering that&apos;s
            missing here - send me a{" "}
            <Link to="/events/suggest" className="text-amber-600 underline">
              suggestion
            </Link>
            !
          </p>
        )}
        {(country || hasGroupedEvents || past || search || status) && (
          <Form
            onChange={() => setIsFiltering(true)}
            onSubmit={handleFormSubmit}
            className="grid gap-8 rounded-lg bg-stone-50 px-4 py-4 sm:gap-4 lg:flex lg:items-center"
          >
            <div
              className={`grid gap-4 lg:gap-2 ${isAuthenticated ? "sm:max-lg:grid-cols-3" : "sm:max-lg:grid-cols-2"} lg:flex`}
            >
              {isAuthenticated && (
                <select
                  onChange={handleSelectChange}
                  autoComplete="off"
                  name="status"
                  id="status"
                  defaultValue={status || ""}
                  className="cursor-pointer rounded border border-stone-300 py-1 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-2"
                >
                  <option value="">Any status</option>
                  <option value="suggested">Suggested</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              )}
              <select
                onChange={handleSelectChange}
                autoComplete="off"
                name="past"
                id="past"
                defaultValue={past || ""}
                className="cursor-pointer rounded border border-stone-300 py-1 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-2"
              >
                <option value="">
                  Upcoming{!isAuthenticated && " events"}
                </option>
                <option value="true">
                  Past{!isAuthenticated && " events"}
                </option>
              </select>
              <Select
                onChange={(e) => handleSelectChange(e, true)}
                name="country"
                id="country"
                options={countryObjects}
                defaultValue={country || ""}
                emptyOption="All countries"
                className="cursor-pointer rounded border border-stone-300 py-1 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-2"
              />
            </div>
            <div className="border-stone-200 max-lg:hidden lg:h-6 lg:border-l-2" />
            <div className="flex flex-grow gap-2">
              <label className="grid flex-grow gap-2 sm:flex sm:items-center">
                <span className="flex-shrink">Title search</span>
                <input
                  onChange={debouncedHandleSearchChange}
                  autoComplete="off"
                  type="text"
                  name="search"
                  id="search"
                  defaultValue={search || ""}
                  className="flex-grow rounded border border-stone-300 py-1 font-semibold placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow max-sm:w-full sm:py-2"
                />
              </label>
              {isFiltering ? (
                <div className="flex-shrink self-end rounded border border-stone-300 p-1 shadow-sm sm:p-2">
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
                    className="flex-shrink self-end rounded border border-stone-300 bg-white p-1 shadow-sm transition-shadow hover:shadow-md active:shadow sm:p-2"
                    type="button"
                    onClick={handleClearSearch}
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
          </Form>
        )}
      </div>
      {hasGroupedEvents ? (
        <div className="grid gap-8">
          {groupedEvents.map(({ year, months }) => (
            <div className="grid gap-4" key={year}>
              <h2 className="text-2xl font-bold sm:text-3xl">
                {year === "0" ? "Missing date info" : year}
              </h2>
              {months.map(({ month, events }) => (
                <div className="grid gap-4" key={`${year}_${month}`}>
                  {month !== "0" && (
                    <h3 className="text-xl font-bold sm:text-2xl">
                      {new Date(`${year}-${month}`).toLocaleString("en", {
                        month: "long",
                      })}
                    </h3>
                  )}
                  {events.map((event) => (
                    <EventListCard
                      eventsIndex
                      eventsIndexFiltersCountry={Boolean(country)}
                      eventsIndexFiltersStatus={Boolean(status)}
                      key={event.id}
                      id={event.id}
                      slug={event.slug}
                      status={isAuthenticated ? event.status : undefined}
                      title={event.title}
                      country={event.country}
                      location={event.location}
                      dateStart={event.dateStart}
                      dateEnd={event.dateEnd}
                      timeStart={event.timeStart}
                      timeEnd={event.timeEnd}
                    />
                  ))}
                </div>
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
        hasGroupedEvents && (
          <div className="flex items-center justify-center gap-2 max-[399px]:flex-col sm:gap-4 sm:text-lg">
            <div className="rounded bg-emerald-100 p-2 sm:px-4">
              <span className="text-amber-600">(S)</span> Suggested
            </div>
            <div className="rounded bg-sky-100 p-2 sm:px-4">
              <span className="text-amber-600">(D)</span> Draft
            </div>
            <div className="rounded bg-white p-2 sm:px-4">Published</div>
          </div>
        )
      ) : (
        <div className="grid gap-8 xl:grid-cols-3 xl:gap-16">
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
