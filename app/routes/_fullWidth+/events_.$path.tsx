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
import { blurhashToCssGradientString } from "@unpic/placeholder";
import { Image } from "@unpic/react";
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
import { authenticator, prisma, requireUserSession } from "~/services";
import { EventStatus, getStatusColors } from "~/utils";
import { deleteFileFromB2 } from "~/utils/b2s3Functions.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.event?.title} ~ SpiritEvents.cz`,
    },
    ...(data?.event?.imageKey
      ? [
          {
            property: "og:image",
            content: `${import.meta.env.VITE_B2_CDN_ALIAS}/events/${data?.event?.imageKey}`,
          },
        ]
      : []),
  ];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserSession(request);
  const id = params.path?.slice(0, 8);
  const formData = await request.formData();
  const dateStart = formData.get("dateStart");
  const intent = formData.get("intent");
  const imageId = formData.get("imageId");
  const imageKey = formData.get("imageKey");
  switch (intent) {
    case "delete":
      await prisma.event.delete({ where: { id } });
      await deleteFileFromB2(`events/${imageKey}`, `${imageId}`);
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
  const id = params.path?.slice(0, 8);
  const dashAndSlug = params.path?.slice(8);
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
  if (`-${event.slug}` !== dashAndSlug) {
    throw redirect(`/events/${id}-${event.slug}`, 301);
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
  const isWorking = fetcher.state !== "idle" || navigation.state !== "idle";
  const [statusLetter] = getStatusColors(event.status);
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
  const imagePlaceholder =
    event.imageBlurHash && event.imageKey
      ? blurhashToCssGradientString(event.imageBlurHash)
      : "radial-gradient(at 0 0,#762143,#00000000 50%),radial-gradient(at 33% 0,#7d4656,#00000000 50%),radial-gradient(at 67% 0,#9b6b64,#00000000 50%),radial-gradient(at 100% 0,#926b66,#00000000 50%),radial-gradient(at 0 50%,#9e4e36,#00000000 50%),radial-gradient(at 33% 50%,#8d534a,#00000000 50%),radial-gradient(at 67% 50%,#b97d5a,#00000000 50%),radial-gradient(at 100% 50%,#c1885f,#00000000 50%),radial-gradient(at 0 100%,#a96e33,#00000000 50%),radial-gradient(at 33% 100%,#9d6f41,#00000000 50%),radial-gradient(at 67% 100%,#c58f51,#00000000 50%),radial-gradient(at 100% 100%,#cf9c59,#00000000 50%)";
  return (
    <>
      <div className="bg-emerald-100 dark:bg-black/25">
        <div className="mx-auto grid w-full max-w-7xl md:flex xl:pr-8">
          {event.imageKey && (
            <div
              className={`flex bg-black/25 md:order-2 md:w-1/2 ${event.imageKey ? "" : "max-md:hidden"}`}
            >
              <Image
                src={`${import.meta.env.VITE_B2_CDN_ALIAS}/events/${event.imageKey}`}
                alt="Event background"
                className={`self-center ${event.imageKey ? "" : "h-full opacity-50"}`}
                layout="fullWidth"
                background={imagePlaceholder}
              />
            </div>
          )}
          <div
            className={`flex px-4 py-8 sm:px-8 ${event.imageKey ? "md:order-1 md:w-1/2" : ""}`}
          >
            <div className="grid gap-8">
              <div className="grid gap-2">
                <h1 className="text-2xl font-bold leading-snug sm:text-3xl sm:leading-snug">
                  {statusLetter && (
                    <>
                      <span className="text-amber-600">{statusLetter}</span>{" "}
                    </>
                  )}
                  {event.title}
                </h1>
                {event.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-lg leading-snug sm:text-xl sm:leading-snug">
                    {event.categories.map((category, idx) => (
                      <Fragment key={category.id}>
                        {idx !== 0 && <span className="opacity-50">&amp;</span>}
                        <span className="font-semibold text-emerald-600">
                          {category.name}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                )}
              </div>
              {(event.linkFbEvent ||
                event.linkTickets ||
                event.linkWebsite) && (
                <div className="flex items-center gap-2 text-lg font-semibold leading-snug text-amber-600 underline max-[319px]:grid sm:text-xl sm:leading-snug">
                  <svg
                    className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7"
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
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                  <div className="flex items-center gap-4">
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
                </div>
              )}

              <div className="grid text-lg font-semibold leading-tight sm:text-xl sm:leading-tight">
                <div className="grid gap-2">
                  {event.dateStart ? (
                    <div
                      className={`grid gap-2 sm:flex ${event.imageKey ? "md:grid xl:flex" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7"
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
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-6 w-6 rotate-90 opacity-50 sm:h-7 sm:w-7"
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
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7"
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
                            className="h-6 w-6 rotate-90 opacity-50 sm:h-7 sm:w-7"
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
              <div className="grid gap-2">
                {event.location && (
                  <div className="flex items-center gap-2 text-lg font-semibold leading-snug sm:text-xl sm:leading-snug">
                    <svg
                      className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7"
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
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    {event.location}
                  </div>
                )}
                {event.linkLocation && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7"
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
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>
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
            </div>
          </div>
        </div>
      </div>
      {isAuthenticated && (
        <div className="bg-white dark:bg-stone-950">
          <div className="flex flex-wrap justify-center gap-4 px-4 py-4 sm:px-8">
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
            {event.status !== EventStatus.PUBLISHED && event.dateStart && (
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
              <input type="hidden" name="imageId" value={event.imageId} />
              <input type="hidden" name="imageKey" value={event.imageKey} />
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
          </div>
        </div>
      )}
      <div className="flex justify-center">
        <div className="grid w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
          <div className="grid gap-8">
            {event.description && (
              <div
                className="prose prose-lg prose-basic w-full max-w-full sm:prose-xl dark:prose-invert lg:border-r-[2rem] lg:border-dotted lg:border-emerald-100 lg:pr-[15%] xl:pr-[20%] dark:lg:border-black/25"
                dangerouslySetInnerHTML={{
                  __html: event.description,
                }}
              />
            )}
            <div className="grid text-right text-lg text-amber-600">
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
                  Last update:
                  <br />
                  {new Date(event.updatedAt).toDateString()}
                </span>
              )}
            </div>
            <div className="flex justify-end">
              <button
                disabled={isWorking}
                type="button"
                onClick={() => navigate(-1)}
                className="rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:border-white dark:text-white"
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
