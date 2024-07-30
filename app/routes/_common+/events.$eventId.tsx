import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
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
  return { event, isAuthenticated: !!user };
}

export default function ShowEvent() {
  const { event, isAuthenticated } = useLoaderData<typeof loader>();
  const getCountryNameByCode = (code: string) => {
    const country = countries.find((country) => country.code === code);
    return country ? country.name : code;
  };
  return (
    <div>
      <div className="mb-8 grid border-y border-amber-600 bg-white text-center max-sm:-mx-4 sm:rounded-lg sm:border-x">
        <div className="grid gap-8 px-4 py-8">
          <div className="grid gap-2">
            <h1 className="text-3xl sm:text-4xl">{event.title}</h1>
            <p className="text-lg text-amber-600 sm:text-xl">
              {getCountryNameByCode(event.country)} ({event.country})
            </p>
          </div>
          <div className="grid text-lg sm:flex sm:justify-center sm:gap-2 sm:text-xl">
            <span>{new Date(event.dateStart).toDateString()}</span>
            {event.dateEnd !== event.dateStart && (
              <>
                <span className="text-amber-600">&gt;&gt;</span>
                <span>{new Date(event.dateEnd).toDateString()}</span>
              </>
            )}
          </div>
          {(event.linkMap || event.linkWebsite) && (
            <div className="grid items-center justify-center gap-2 text-amber-600 sm:flex sm:gap-8 sm:text-lg">
              {event.linkWebsite && (
                <a href={event.linkWebsite} className="underline">
                  Website
                </a>
              )}
              {event.linkMap && (
                <a href={event.linkMap} className="underline">
                  Google Maps
                </a>
              )}
            </div>
          )}
        </div>
        {event.description && (
          <section
            className="prose prose-amber max-w-none bg-amber-100 px-4 py-8 text-lg sm:text-xl"
            id="description"
            dangerouslySetInnerHTML={{
              __html: marked.parse(event.description),
            }}
          />
        )}
        <div className="grid px-4 py-8 text-amber-600">
          {isAuthenticated ? (
            <>
              <span>ID: {event.id}</span>
              <span>Created at: {new Date(event.createdAt).toUTCString()}</span>
              <span>Updated at: {new Date(event.updatedAt).toUTCString()}</span>
            </>
          ) : (
            <span>
              Last updated on {new Date(event.updatedAt).toUTCString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-4">
        {isAuthenticated && (
          <>
            <Form action="edit">
              <button
                type="submit"
                className="rounded border border-transparent bg-amber-800 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
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
                className="rounded border border-transparent bg-red-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
              >
                Delete
              </button>
            </Form>
          </>
        )}
        <Link
          to="/events"
          className="rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
