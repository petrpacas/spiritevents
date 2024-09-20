import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Fragment } from "react/jsx-runtime";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from "remix-toast";
import { unified } from "unified";
import bgImage from "~/images/bg.jpg";
import { authenticator, prisma, requireUserSession } from "~/services";
import { countries, EventStatus, getStatusColors } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.event?.title} ~ SeekGathering` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserSession(request);
  const id = params.path?.slice(-8);
  const formData = await request.formData();
  const dateStart = formData.get("dateStart");
  const intent = formData.get("intent");
  switch (intent) {
    case "delete":
      await prisma.event.delete({ where: { id } });
      return redirectWithSuccess("/events", "Event deleted");
    case "draft":
      await prisma.event.update({
        data: { status: EventStatus.DRAFT },
        where: { id },
      });
      return jsonWithSuccess(null, "Event set as a draft");
    case "publish":
      if (!dateStart) {
        return jsonWithError(null, "Event is missing date info");
      } else {
        await prisma.event.update({
          data: { status: EventStatus.PUBLISHED },
          where: { id },
        });
        return jsonWithSuccess(null, "Event published");
      }
    default:
      break;
  }
  return null;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const isAuthenticated = Boolean(user);
  const id = params.path?.slice(-8);
  const slugAndDash = params.path?.slice(0, -8);
  const event = await prisma.event.findUnique({
    where: {
      id,
      status: isAuthenticated ? undefined : EventStatus.PUBLISHED,
    },
    include: { categories: { orderBy: { name: "asc" } } },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  if (`${event.slug}-` !== slugAndDash) {
    throw redirect(`/events/${event.slug}-${id}`, 301);
  }
  const description = event.description;
  const parsedDescription = description
    ? await unified()
        .use(remarkParse)
        .use(remarkBreaks)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeExternalLinks, {
          rel: ["noopener", "noreferrer"],
          target: "_blank",
        })
        .use(rehypeStringify)
        .process(description)
    : "";
  event.description = String(parsedDescription);
  return { event, isAuthenticated };
}

export default function Event() {
  const fetcher = useFetcher();
  const { event, isAuthenticated } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isWorking = navigation.state !== "idle";
  const getCountryNameByCode = (code: string) => {
    const country = countries.find((country) => country.code === code);
    return country ? country.name : code;
  };
  const [statusLetter, statusBg, statusGradient, statusGlow, statusGlowMd] =
    getStatusColors(event.status);
  const handlePublishSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = confirm("Do you really want to publish the event?");
    if (!response) {
      return;
    }
    const $form = e.currentTarget;
    const formData = new FormData($form);
    formData.set("dateStart", event.dateStart);
    formData.set("intent", "publish");
    fetcher.submit(formData, { method: "POST" });
  };
  return (
    <>
      <div className="relative grid min-h-lvh bg-cover bg-center">
        <img
          src={bgImage}
          alt="Elizabeth Anura - Medicine Festival 2023"
          className="absolute left-0 top-0 h-full w-full object-cover"
        />
        <div
          className={`relative grid min-h-lvh items-center justify-center ${statusGradient}`}
        >
          <div
            className={`max-w-7xl px-4 py-[6.625rem] ${statusGlow} sm:px-8 ${statusGlowMd}`}
          >
            <div className="grid gap-8 text-center lg:gap-16">
              <div className="grid gap-4">
                {event.categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 text-lg font-semibold leading-snug text-emerald-600 sm:text-xl sm:leading-snug lg:text-2xl lg:leading-snug">
                    {event.categories.map((category, idx) => (
                      <Fragment key={category.id}>
                        {idx !== 0 && <span className="text-amber-600">~</span>}
                        <span>{category.name}</span>
                      </Fragment>
                    ))}
                  </div>
                )}
                <h1 className="text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-snug">
                  {statusLetter && (
                    <>
                      <span className="text-amber-600">{statusLetter}</span>{" "}
                    </>
                  )}
                  {event.title}
                </h1>
                {(event.linkFbEvent ||
                  event.linkTickets ||
                  event.linkWebsite) && (
                  <div className="flex justify-center gap-4 text-lg font-semibold leading-snug text-amber-600 underline max-[319px]:grid sm:text-xl sm:leading-snug">
                    {event.linkWebsite && (
                      <a
                        href={event.linkWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    )}
                    {event.linkFbEvent && (
                      <a
                        href={event.linkFbEvent}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        FB event
                      </a>
                    )}
                    {event.linkTickets && (
                      <a
                        href={event.linkTickets}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Tickets
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                <p className="text-xl font-semibold leading-snug sm:text-2xl sm:leading-snug lg:text-3xl lg:leading-snug">
                  {event.location && `${event.location}, `}
                  {getCountryNameByCode(event.country)}
                </p>
                {event.linkLocation && (
                  <div>
                    <a
                      href={event.linkLocation}
                      className="text-lg font-semibold leading-snug text-amber-600 underline sm:text-xl sm:leading-snug"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Location map
                    </a>
                  </div>
                )}
              </div>
              <div className="grid text-xl font-semibold leading-tight sm:text-2xl sm:leading-tight lg:text-3xl lg:leading-tight">
                <div className="grid justify-center gap-2">
                  {event.dateStart ? (
                    <div className="grid gap-2 sm:flex">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
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
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                          />
                        </svg>
                        <span>{new Date(event.dateStart).toDateString()}</span>
                      </div>
                      {event.dateEnd && event.dateEnd !== event.dateStart && (
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="h-6 w-6 rotate-90 opacity-50 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
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
                              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                            />
                          </svg>
                          <span>{new Date(event.dateEnd).toDateString()}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-red-600">Missing date info</span>
                  )}
                  {event.timeStart && (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
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
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <span>{event.timeStart}</span>
                      {event.timeEnd && (
                        <>
                          <svg
                            className="h-6 w-6 rotate-90 opacity-50 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
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
                              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                            />
                          </svg>
                          <span>{event.timeEnd}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex justify-center ${statusBg}`}>
        <div className="grid w-full max-w-7xl px-4 py-16 sm:px-8">
          <div className="grid gap-8">
            {event.description && (
              <div
                className="prose prose-amber-basic mx-auto w-full max-w-4xl sm:prose-lg xl:prose-xl dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: event.description,
                }}
              />
            )}
            <div className="grid gap-4 text-center text-amber-600">
              {isAuthenticated ? (
                <>
                  <span className="break-all">ID: {event.id}</span>
                  <span>
                    CreatedAt: {new Date(event.createdAt).toUTCString()}
                  </span>
                  <span>
                    UpdatedAt: {new Date(event.updatedAt).toUTCString()}
                  </span>
                </>
              ) : (
                <span>
                  Event last updated on{" "}
                  {new Date(event.updatedAt).toUTCString()}
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated && (
                <>
                  <Form action="edit">
                    <button
                      disabled={isWorking}
                      type="submit"
                      className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </Form>
                  {event.status === EventStatus.PUBLISHED && (
                    <fetcher.Form
                      method="post"
                      onSubmit={(e) => {
                        const response = confirm(
                          "Do you really want to set the event as a draft?",
                        );
                        if (!response) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        disabled={isWorking}
                        type="submit"
                        name="intent"
                        value="draft"
                        className="rounded border border-transparent bg-stone-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                      >
                        Set as draft
                      </button>
                    </fetcher.Form>
                  )}
                  {event.status !== EventStatus.PUBLISHED &&
                    event.dateStart && (
                      <fetcher.Form onSubmit={handlePublishSubmit}>
                        <button
                          disabled={isWorking}
                          type="submit"
                          className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                        >
                          Publish
                        </button>
                      </fetcher.Form>
                    )}
                  <Form
                    method="post"
                    replace
                    onSubmit={(e) => {
                      const response = confirm(
                        "Do you really want to delete the event?",
                      );
                      if (!response) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <button
                      disabled={isWorking}
                      type="submit"
                      name="intent"
                      value="delete"
                      className="rounded border border-transparent bg-red-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </Form>
                </>
              )}
              <button
                disabled={isWorking}
                type="button"
                onClick={() => navigate(-1)}
                className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:text-white"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
