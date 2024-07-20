import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import prisma from "~/services/db.server";
import { CountrySelect } from "~/components";
import { countries } from "~/utils/countries";

export const meta: MetaFunction = () => {
  return [{ title: "All Events ~ Seek Gathering" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const country = requestUrl.searchParams.get("country");
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      dateStart: true,
      dateEnd: true,
      country: true,
    },
    where: { country: country || undefined },
    orderBy: [{ dateStart: "asc" }],
  });
  return { events, country };
}

export default function Events() {
  const { events, country } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const getCountryCodesFromEvents = () => {
    return events.map((event) => event.country);
  };
  const filterCountriesForEvent = (eventCountries: string[]) => {
    return countries.filter((country) => eventCountries.includes(country.code));
  };
  const getCountryNameByCode = (code: string) => {
    const country = countries.find((country) => country.code === code);
    return country ? country.name : code;
  };
  const eventCountries = getCountryCodesFromEvents();
  const filteredCountries = filterCountriesForEvent(eventCountries);

  return (
    <>
      <h1 className="text-4xl mb-8">All Events</h1>
      {country ? (
        <div className="mb-8">
          Filtered by country: {getCountryNameByCode(country)}
        </div>
      ) : (
        <Form
          className="mb-8"
          onChange={(event) => {
            submit(event.currentTarget);
          }}
        >
          <label className="flex flex-col gap-2" htmlFor="country">
            Filter by country
            <CountrySelect filteredCountries={filteredCountries} />
          </label>
        </Form>
      )}
      <div className="flex flex-col gap-2 mb-8">
        {events.map((event) => (
          <Link
            key={event.id}
            className="text-2xl flex items-center justify-between"
            to={`/events/${event.id}`}
          >
            <span>{event.title || "n/a"}</span>
            <span className="text-base flex gap-4">
              <span>{event.dateStart}</span>
              {event.dateEnd && (
                <>
                  <span className="text-slate-400">&gt;&gt;</span>
                  <span>{event.dateEnd}</span>
                </>
              )}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <Link to="/events/new">Add New Event</Link>
        <Link to={country ? "/events" : "/"}>Back</Link>
      </div>
    </>
  );
}
