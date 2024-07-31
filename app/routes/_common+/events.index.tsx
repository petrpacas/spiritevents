import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { CountrySelect, EventListCard } from "~/components";
import { authenticator, prisma } from "~/services";
import { countries, getTodayDate, enumEventStatus } from "~/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Upcoming events ~ Seek Gathering" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const requestUrl = new URL(request.url);
  const country = requestUrl.searchParams.get("country");
  const events = await prisma.event.findMany({
    orderBy: [{ dateStart: "asc" }],
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
  return { country, events, isAuthenticated: !!user };
}

export default function Events() {
  const { country, events, isAuthenticated } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const getCountryNameByCode = (code: string) => {
    const country = countries.find((country) => country.code === code);
    return country ? country.name : code;
  };
  const getCountryCodesFromEvents = () => {
    return events.map((event) => event.country);
  };
  const filterCountriesForEvent = (eventCountries: string[]) => {
    return countries.filter((country) => eventCountries.includes(country.code));
  };
  const eventCountries = getCountryCodesFromEvents();
  const filteredCountries = filterCountriesForEvent(eventCountries);
  return (
    <div>
      <div className="mb-8 grid gap-4 max-md:w-full md:flex md:items-center md:justify-between">
        <h1 className="text-3xl sm:text-4xl">
          {isAuthenticated ? "All" : "Upcoming"} events
        </h1>
        {country ? (
          <div className="grid gap-2 md:flex md:items-center">
            Showing events in{" "}
            <div className="inline-grid">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="col-start-1 row-start-1 rounded border border-gray-200 bg-white py-1 pl-3 pr-10 text-left shadow-sm transition-shadow hover:shadow-md active:shadow"
              >
                {getCountryNameByCode(country)}
              </button>
              <svg
                className="pointer-events-none relative right-3 col-start-1 row-start-1 h-5 w-5 self-center justify-self-end text-gray-500 forced-colors:hidden"
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
            </div>
          </div>
        ) : (
          <Form
            className="md:flex"
            onChange={(event) => {
              submit(event.currentTarget);
            }}
          >
            <label
              className="grid items-center gap-2 md:flex"
              htmlFor="country"
            >
              Showing events in
              <CountrySelect
                filteredCountries={filteredCountries}
                className="rounded border border-gray-200 bg-white py-1 shadow-sm transition-shadow hover:shadow-md active:shadow"
              />
            </label>
          </Form>
        )}
      </div>
      <div className="mb-8 grid gap-2">
        {events.map((event) => (
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
      <div className="flex items-center justify-between gap-4">
        {isAuthenticated ? (
          <div className="text-sm sm:max-md:text-base md:text-lg">
            <span className="text-amber-600">(S)</span>UGGESTION or{" "}
            {/* <span className="text-amber-600">(D)</span>RAFT / */}PUBLISHED
          </div>
        ) : (
          <div />
        )}
        <Link
          to={country ? "/events" : "/"}
          className="rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
