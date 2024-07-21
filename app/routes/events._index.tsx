import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import prisma from "~/services/db.server";
import { CountrySelect, EventListCard } from "~/components";
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
  return { country, events };
}

export default function Events() {
  const { country, events } = useLoaderData<typeof loader>();
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
    <>
      <h1 className="mb-8 text-4xl">All Events</h1>
      {country ? (
        <div className="mb-8">
          Filtered by country: {getCountryNameByCode(country)}
        </div>
      ) : (
        <Form
          className="mb-8"
          onChange={(event) => {
            console.log(event);
            submit(event.currentTarget);
          }}
        >
          <label className="flex items-center gap-2" htmlFor="country">
            Filter by country:
            <CountrySelect
              filteredCountries={filteredCountries}
              className="rounded bg-white pl-2 pr-6 hover:shadow-md active:shadow"
            />
          </label>
        </Form>
      )}
      <div className="mb-8 grid gap-2">
        {events.map((event) => (
          <EventListCard
            key={event.id}
            id={event.id}
            title={event.title}
            country={event.country}
            dateStart={event.dateStart}
            dateEnd={event.dateEnd}
          />
        ))}
      </div>
      <div className="flex justify-end gap-4">
        <Link
          to={country ? "/events" : "/"}
          className="rounded border border-amber-600 bg-white px-4 py-2 text-amber-600 hover:shadow-md active:shadow"
        >
          Back
        </Link>
      </div>
    </>
  );
}
