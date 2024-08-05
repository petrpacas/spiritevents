import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { authenticator, prisma, requireUserSession } from "~/services";
import { countries, enumEventStatus, getStatusConsts } from "~/utils";

// GET PERMISSION
import bgImage from "~/images/phoebe-montague_medicine-festival-2023-watermark.jpg";
// GET PERMISSION

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.event?.title} ~ SeekGathering` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "delete":
      await prisma.event.delete({ where: { slug: params.slug } });
      return redirect("/events");
    case "publish":
      await prisma.event.update({
        data: { status: enumEventStatus.PUBLISHED },
        where: { slug: params.slug },
      });
      break;
    default:
      break;
  }
  return null;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const event = await prisma.event.findUnique({
    where: {
      slug: params.slug,
      status: user ? undefined : enumEventStatus.PUBLISHED,
    },
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
  const [statusLetter, statusBg] = getStatusConsts(event.status);
  return (
    <>
      <div
        className="grid min-h-lvh bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="grid min-h-lvh items-center justify-center bg-[linear-gradient(rgba(254,243,199,1),rgba(254,243,199,.75),rgba(254,243,199,1))]">
          <h2 className="px-4 py-[6.625rem] text-center text-3xl font-bold leading-loose drop-shadow-[0_0_1.875rem_rgb(254,243,199)] sm:px-8 md:text-4xl md:leading-loose md:drop-shadow-[0_0_2.25rem_rgb(254,243,199)]">
            <div className="grid gap-8 px-4 py-8">
              <div className="grid gap-2">
                <h1 className="text-3xl sm:text-4xl">
                  {statusLetter && (
                    <>
                      <span className="text-amber-600">{statusLetter}</span>{" "}
                    </>
                  )}
                  {event.title}
                </h1>
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
              {(event.linkLocation || event.linkWebsite) && (
                <div className="grid items-center justify-center gap-4 text-amber-600 sm:text-lg">
                  {event.linkWebsite && (
                    <a href={event.linkWebsite} className="underline">
                      Website
                    </a>
                  )}
                  {event.linkLocation && (
                    <a href={event.linkLocation} className="underline">
                      Location
                    </a>
                  )}
                </div>
              )}
            </div>
          </h2>
        </div>
      </div>
      <main className="flex justify-center">
        <div className="grid w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
          <div className="grid gap-8">
            <div
              className={`${statusBg} grid rounded-lg border border-amber-600 text-center`}
            >
              {event.description && (
                <div className="bg-amber-100">
                  <div
                    className="prose prose-amber mx-auto px-4 py-16 text-center text-lg sm:px-8 sm:text-xl"
                    id="description"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(event.description),
                    }}
                  />
                </div>
              )}
              <div className="grid px-4 py-8 text-amber-600">
                {isAuthenticated ? (
                  <>
                    <span>ID: {event.id}</span>
                    <span>
                      CreatedAt: {new Date(event.createdAt).toUTCString()}
                    </span>
                    <span>
                      UpdatedAt: {new Date(event.updatedAt).toUTCString()}
                    </span>
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
                  {event.status !== enumEventStatus.PUBLISHED && (
                    <Form replace method="post">
                      <button
                        type="submit"
                        name="intent"
                        value="publish"
                        className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
                      >
                        Publish
                      </button>
                    </Form>
                  )}
                  <Form action="edit">
                    <button
                      type="submit"
                      className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
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
                      name="intent"
                      value="delete"
                      className="rounded border border-transparent bg-red-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
                    >
                      Delete
                    </button>
                  </Form>
                </>
              )}
              <Link
                to="/events"
                className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
