import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { authenticator, prisma, requireUserSession } from "~/services";
import { countries } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.event?.title} ~ Seek Gathering` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserSession(request);
  await prisma.event.delete({ where: { id: params.eventId } });
  return redirect("/events");
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  return { event, user: !!user };
}

export default function ShowEvent() {
  const { event, user } = useLoaderData<typeof loader>();
  const getCountryNameByCode = (code: string) => {
    const country = countries.find((country) => country.code === code);
    return country ? country.name : code;
  };
  return (
    <>
      <div className="mb-8 grid gap-8 border-y border-amber-600 bg-white px-4 py-8 max-sm:-mx-4 sm:rounded-lg sm:border-x">
        <div className="text-center">
          <h1 className="mb-2 text-3xl sm:text-4xl">{event.title}</h1>
          <p className="text-lg text-amber-600 sm:text-xl">
            {getCountryNameByCode(event.country)} ({event.country})
          </p>
        </div>
        <div className="grid text-center text-lg sm:flex sm:justify-center sm:gap-2 sm:text-xl">
          <span>{new Date(event.dateStart).toDateString()}</span>
          {event.dateEnd !== event.dateStart && (
            <>
              <span className="text-amber-600">&gt;&gt;</span>
              <span>{new Date(event.dateEnd).toDateString()}</span>
            </>
          )}
        </div>
        {(event.coords || event.link) && (
          <div className="-mx-4 grid gap-4 border-t border-amber-600 px-4 pt-8 text-amber-600 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:text-lg">
            {event.coords && (
              <a
                href={`https://www.google.com/maps?q=${event.coords}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Google Maps Coords
              </a>
            )}
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {event.link}
              </a>
            )}
          </div>
        )}
        {event.description && (
          <div className="-mx-4 border-t border-amber-600 px-4 pt-8 text-lg sm:text-xl">
            {event.description}
          </div>
        )}
        {user && (
          <div className="-mx-4 grid border-t border-amber-600 px-4 pt-8 text-amber-600 sm:justify-end sm:text-right">
            <span>id: {event.id}</span>
            <span>createdAt: {event.createdAt}</span>
            <span>updatedAt: {event.updatedAt}</span>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        {user && (
          <>
            <Form action="edit">
              <button
                type="submit"
                className="rounded border border-transparent bg-amber-800 px-4 py-2 text-white hover:shadow-md active:shadow"
              >
                Edit
              </button>
            </Form>
            <Form
              replace
              method="post"
              onSubmit={(event) => {
                const response = confirm(
                  "Do you really want to delete this event?",
                );
                if (!response) {
                  event.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="rounded border border-transparent bg-red-600 px-4 py-2 text-white hover:shadow-md active:shadow"
              >
                Delete
              </button>
            </Form>
          </>
        )}
        <Link
          to="/events"
          className="rounded border border-amber-800 px-4 py-2 text-amber-800 hover:shadow-md active:shadow"
        >
          Back
        </Link>
      </div>
    </>
  );
}
