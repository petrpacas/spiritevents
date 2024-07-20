import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/services/session.server";
import { authenticator } from "~/services/auth.server";
import prisma from "~/services/db.server";
import { countries } from "~/utils/countries";

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
      <div className="mb-8 grid gap-8 rounded-lg border border-amber-600 bg-white p-8">
        <h1 className="text-4xl">{event.title}</h1>
        <div className="grid">
          <div className="flex items-center justify-between gap-8 text-2xl">
            <p>
              {getCountryNameByCode(event.country)} ({event.country})
            </p>
            <p className="flex gap-2">
              <span>{new Date(event.dateStart).toDateString()}</span>
              {event.dateEnd && (
                <>
                  <span className="text-neutral-400">&gt;&gt;</span>
                  <span>{new Date(event.dateEnd).toDateString()}</span>
                </>
              )}
            </p>
          </div>
          {(event.coords || event.link) && (
            <div className="flex items-center justify-between gap-8 text-lg text-neutral-400">
              <div>
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
              </div>
              <div>
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
            </div>
          )}
        </div>
        <div className="text-xl">{event.description}</div>
        {user && (
          <div className="grid justify-end text-right text-neutral-400">
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
                className="rounded bg-amber-600 px-4 py-2 text-white"
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
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </Form>
          </>
        )}
        <Link
          to="/events"
          className="rounded border border-amber-600 bg-white px-4 py-2 text-amber-600"
        >
          Back
        </Link>
      </div>
    </>
  );
}
