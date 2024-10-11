import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Category, Prisma } from "@prisma/client";
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
import { getTodayDate, EventStatus, regions } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title:
        (data?.past ? "Past" : "Upcoming") +
        " events in Czechia ~ SeekGathering",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const user = await authenticator.isAuthenticated(request);
  const categorySlugs = requestUrl.searchParams.getAll("category");
  const past = requestUrl.searchParams.get("past");
  const region = requestUrl.searchParams.get("region");
  const search = requestUrl.searchParams.get("search");
  const status = requestUrl.searchParams.get("status");
  const isAuthenticated = Boolean(user);
  const isPast = past === "true";
  const today = getTodayDate();
  type EventObject = {
    categories: Category[];
    dateEnd: string;
    dateStart: string;
    id: string;
    imageBlurHash: string;
    imageKey: string;
    location: string;
    region: string;
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
  const allCategories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
  });
  const { join, raw, sql } = Prisma;
  const searchConditions =
    search
      ?.trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter((term) => term.length > 0)
      .map(
        (term) =>
          sql`unaccent(LOWER(title)) LIKE unaccent(LOWER(${`%${term}%`}))`,
      ) || [];
  const allEvents: EventObject[] = await prisma.$queryRaw`
    SELECT
      e."dateEnd",
      e."dateStart",
      e."id",
      e."imageBlurHash",
      e."imageKey",
      e."location",
      e."region",
      e."slug",
      e."status",
      e."timeEnd",
      e."timeStart",
      e."title",
      COALESCE(
        json_agg(
          CASE
            WHEN c."id" IS NOT NULL THEN
              json_build_object(
                'id', c."id",
                'name', c."name",
                'slug', c."slug"
              )
          END
          ORDER BY c."name" ASC
        ) FILTER (WHERE c."id" IS NOT NULL), '[]'
      ) AS "categories"
    FROM "Event" e
    LEFT JOIN "_CategoryToEvent" ce ON e."id" = ce."B"
    LEFT JOIN "Category" c ON ce."A" = c."id"
    WHERE
      ${region ? sql`e."region" = ${region}` : sql`TRUE`}
      AND ${
        isAuthenticated
          ? status && eventStatusEnumMatch
            ? sql`e."status" = ${raw(`'${eventStatusEnumMatch}'`)}`
            : sql`TRUE`
          : sql`e."status" = ${raw(`'${EventStatus.PUBLISHED}'`)}`
      }
      AND (
        ${
          isPast
            ? sql`e."dateEnd" < ${today} AND e."dateEnd" != ''`
            : sql`e."dateEnd" >= ${today}`
        }
        OR ${isAuthenticated ? sql`e."dateEnd" = ''` : sql`FALSE`}
      )
      AND ${
        searchConditions.length > 0
          ? sql`(${join(searchConditions, " AND ")})`
          : sql`TRUE`
      }
      AND ${
        categorySlugs && categorySlugs.length > 0 && categorySlugs[0] !== ""
          ? sql`EXISTS (
            SELECT 1
            FROM "_CategoryToEvent" ce2
            JOIN "Category" c2 ON ce2."A" = c2."id"
            WHERE
              ce2."B" = e."id"
              AND c2."slug" IN (${join(categorySlugs)})
          )`
          : sql`TRUE`
      }
    GROUP BY
      e."id"
    ORDER BY
      e."dateStart" ${isPast ? sql`DESC` : sql`ASC`},
      e."timeStart" ${isPast ? sql`DESC` : sql`ASC`},
      e."title" ASC
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
    const sortedEvents = Object.entries(groupedEvents)
      .map(([year, months]) => ({
        year,
        months: Object.entries(months)
          .map(([month, events]) => ({
            month,
            events,
          }))
          .sort((a, b) => {
            const monthA = parseInt(a.month);
            const monthB = parseInt(b.month);
            return isPast ? monthB - monthA : monthA - monthB;
          }),
      }))
      .sort((a, b) => {
        const yearA = parseInt(a.year);
        const yearB = parseInt(b.year);
        return isPast ? yearB - yearA : yearA - yearB;
      });
    return sortedEvents;
  }
  const groupedEvents = groupEvents(allEvents);
  return {
    allCategories,
    categorySlugs,
    groupedEvents,
    isAuthenticated,
    past,
    region,
    search,
    status,
  };
}

export default function Events() {
  const {
    allCategories,
    categorySlugs,
    groupedEvents,
    isAuthenticated,
    past,
    region,
    search,
    status,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isWorking = navigation.state !== "idle";
  const submit = useSubmit();
  const [isFiltering, setIsFiltering] = useState(false);
  const hasGroupedEvents = groupedEvents.length > 0;
  const handleFiltering = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    if (formData.get("status") === "") {
      formData.delete("status");
    }
    if (formData.get("past") === "") {
      formData.delete("past");
    }
    if (formData.get("region") === "") {
      formData.delete("region");
    }
    if (formData.get("category") === "") {
      formData.delete("category");
    }
    if (formData.get("search") === "") {
      formData.delete("search");
    }
    submit(formData, { preventScrollReset: true });
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.currentTarget.form) {
      debouncedHandleSearchChange.cancel();
      handleFiltering(e.currentTarget.form);
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.form) {
      handleFiltering(e.target.form);
    }
  };
  const debouncedHandleSearchChange = useDebouncedCallback(
    handleSearchChange,
    1000,
  );
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.form) {
      debouncedHandleSearchChange.cancel();
      handleFiltering(e.target.form);
    }
  };
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debouncedHandleSearchChange.cancel();
    handleFiltering(e.currentTarget);
  };
  const handleClearSearch = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (e.currentTarget.form) {
      const formData = new FormData(e.currentTarget.form);
      if (formData.get("status") === "") {
        formData.delete("status");
      }
      if (formData.get("past") === "") {
        formData.delete("past");
      }
      if (formData.get("region") === "") {
        formData.delete("region");
      }
      if (formData.get("category") === "") {
        formData.delete("category");
      }
      formData.delete("search");
      const searchEl = document.getElementsByName("search")[0];
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
    const statusEl = document.getElementsByName("status")[0];
    const pastEl = document.getElementsByName("past")[0];
    const regionEl = document.getElementsByName("region")[0];
    const categoryEls = document.getElementsByName("category");
    const searchEl = document.getElementsByName("search")[0];
    if (statusEl instanceof HTMLSelectElement) {
      statusEl.value = status || "";
    }
    if (pastEl instanceof HTMLSelectElement) {
      pastEl.value = past || "";
    }
    if (regionEl instanceof HTMLSelectElement) {
      regionEl.value = region || "";
    }
    categoryEls.forEach((categoryEl) => {
      if (categoryEl instanceof HTMLInputElement) {
        categoryEl.checked = categorySlugs.includes(categoryEl.value) || false;
      }
    });
    if (searchEl instanceof HTMLInputElement) {
      searchEl.value = search || "";
    }
  }, [status, past, region, categorySlugs, search]);
  return (
    <div className="grid gap-8">
      <div className="grid items-center gap-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">
          <svg
            className="h-8 w-8 shrink-0 text-amber-600 max-xl:hidden sm:h-10 sm:w-10"
            width="16px"
            height="16px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          <span>{(past ? "Past" : "Upcoming") + " events in Czechia"}</span>
        </h1>
        {!isAuthenticated && (
          <p className="text-lg sm:text-xl">
            Browse through the myriad of nourishing events in Czech Republic to
            get informed and inspired. And if you know of a gathering
            that&apos;s missing here - send me a{" "}
            <Link to="/events/suggest" className="text-amber-600 underline">
              suggestion
            </Link>
            !
          </p>
        )}
        {(categorySlugs ||
          hasGroupedEvents ||
          past ||
          region ||
          search ||
          status) && (
          <Form
            onChange={() => setIsFiltering(true)}
            onSubmit={handleFormSubmit}
            className="grid gap-4 rounded-lg border border-stone-300 bg-white p-2 sm:p-4 dark:bg-transparent"
          >
            <div className="grid gap-4 lg:flex lg:items-center">
              <div
                className={`grid gap-4 lg:gap-2 ${isAuthenticated ? "sm:max-lg:grid-cols-3" : "sm:max-lg:grid-cols-2"} lg:flex`}
              >
                {isAuthenticated && (
                  <select
                    onChange={handleSelectChange}
                    autoComplete="off"
                    name="status"
                    defaultValue={status || ""}
                    className="custom-caret-color cursor-pointer rounded border border-stone-300 py-1 pl-2 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-2 sm:pl-3 dark:bg-stone-800"
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
                  defaultValue={past || ""}
                  className="custom-caret-color cursor-pointer rounded border border-stone-300 py-1 pl-2 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-2 sm:pl-3 dark:bg-stone-800"
                >
                  <option value="">
                    Upcoming{!isAuthenticated && " events"}
                  </option>
                  <option value="true">
                    Past{!isAuthenticated && " events"}
                  </option>
                </select>
                <Select
                  onChange={handleSelectChange}
                  name="region"
                  options={regions}
                  defaultValue={region || ""}
                  emptyOption="All regions"
                  className="custom-caret-color cursor-pointer rounded border border-stone-300 py-1 pl-2 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-2 sm:pl-3 dark:bg-stone-800"
                />
              </div>
              <div className="border-stone-300 max-lg:hidden lg:h-6 lg:border-l-2" />
              <div className="flex flex-grow gap-2">
                <label className="grid flex-grow gap-2 sm:flex sm:items-center">
                  <span className="flex-shrink">Title search</span>
                  <input
                    onChange={debouncedHandleSearchChange}
                    autoComplete="off"
                    type="text"
                    name="search"
                    defaultValue={search || ""}
                    className="flex-grow rounded border border-stone-300 px-2 py-1 font-semibold shadow-sm transition-shadow hover:shadow-md active:shadow max-sm:w-full sm:px-3 sm:py-2 dark:bg-stone-800"
                  />
                </label>
                {isFiltering ? (
                  <div className="flex-shrink self-end rounded border border-stone-300 p-1 shadow-sm sm:p-2">
                    <svg
                      className="h-6 w-6 animate-spin"
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
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </div>
                ) : (
                  search && (
                    <button
                      className="flex-shrink self-end rounded border border-stone-300 bg-white p-1 shadow-sm transition-shadow hover:shadow-md active:shadow sm:p-2 dark:bg-stone-800"
                      type="button"
                      onClick={handleClearSearch}
                    >
                      <svg
                        className="h-6 w-6"
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
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )
                )}
              </div>
            </div>
            {allCategories && allCategories.length > 0 && (
              <div className="grid gap-2 sm:flex sm:items-center">
                <span className="sm:hidden">Categories</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="max-sm:hidden">Categories</span>
                  {allCategories.map((category) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 rounded border border-stone-300 bg-white px-2 py-1 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
                      key={category.id}
                    >
                      <input
                        onChange={handleCheckboxChange}
                        autoComplete="off"
                        type="checkbox"
                        name="category"
                        value={category.slug}
                        defaultChecked={Boolean(
                          categorySlugs.find(
                            (categorySlug) => categorySlug === category.slug,
                          ),
                        )}
                        className="rounded border border-stone-300 checked:bg-amber-600 hover:checked:bg-amber-600 focus:checked:bg-amber-600 dark:bg-stone-800"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Form>
        )}
      </div>
      {hasGroupedEvents ? (
        <div className="grid gap-8">
          {groupedEvents.map(({ year, months }) => (
            <div className="grid gap-4" key={year}>
              <h2 className="text-2xl font-bold leading-snug sm:text-3xl sm:leading-snug">
                {year === "0" ? "Missing date info" : year}
              </h2>
              {months.map(({ month, events }) => (
                <div className="grid gap-4" key={`${year}_${month}`}>
                  {month !== "0" && (
                    <h3 className="text-xl font-bold leading-snug sm:text-2xl sm:leading-snug">
                      {new Date(`${year}-${month}`).toLocaleString("en", {
                        month: "long",
                      })}
                    </h3>
                  )}
                  {events.map((event) => (
                    <EventListCard
                      key={event.id}
                      categories={event.categories}
                      id={event.id}
                      imageBlurHash={event.imageBlurHash}
                      imageKey={event.imageKey}
                      slug={event.slug}
                      status={isAuthenticated ? event.status : undefined}
                      title={event.title}
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
          {categorySlugs || past || region || search || status
            ? "No events found…"
            : "No events yet…"}
        </p>
      )}
      <div className="grid gap-8 xl:grid-cols-3 xl:gap-16">
        {isAuthenticated ? (
          <Link
            to="/events/suggest"
            className="flex items-center justify-center gap-3 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:max-xl:justify-self-end xl:col-start-3"
          >
            Add a new event
            <svg
              className="h-6 w-6 max-[339px]:hidden"
              width="16px"
              height="16px"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </Link>
        ) : (
          <Link
            to="/events/suggest"
            className="flex items-center justify-center gap-3 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:max-xl:justify-self-end xl:col-start-3"
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
        )}
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow dark:text-white"
        >
          Back
        </button>
      </div>
    </div>
  );
}
