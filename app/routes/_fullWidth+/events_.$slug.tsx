import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from "remix-toast";
import { unified } from "unified";
import { authenticator, prisma, requireUserSession } from "~/services";
import { countries, enumEventStatus, getStatusConsts } from "~/utils";

// GET PERMISSIONS
import bgImage from "~/images/elizabeth-anura_medicine-festival-2023-watermark.jpg";
// import bgImage from "~/images/phoebe-montague_medicine-festival-2023-watermark.jpg";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.event?.title} ~ SeekGathering` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const dateStart = formData.get("dateStart");
  const intent = formData.get("intent");
  switch (intent) {
    case "delete":
      await prisma.event.delete({ where: { slug: params.slug } });
      return redirectWithSuccess("/events", "Event deleted");
    case "draft":
      await prisma.event.update({
        data: { status: enumEventStatus.DRAFT },
        where: { slug: params.slug },
      });
      return jsonWithSuccess(null, "Event set as a draft");
    case "publish":
      if (dateStart === "") {
        return jsonWithError(null, "Event is missing date info");
      } else {
        await prisma.event.update({
          data: { status: enumEventStatus.PUBLISHED },
          where: { slug: params.slug },
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
  const event = await prisma.event.findUnique({
    where: {
      slug: params.slug,
      status: user ? undefined : enumEventStatus.PUBLISHED,
    },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  const description = event.description;
  const parsedDescription = description
    ? await unified()
        .use(remarkParse)
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
  return { event, isAuthenticated: !!user };
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
    getStatusConsts(event.status);
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
      <div
        className="grid min-h-lvh bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div
          className={`grid min-h-lvh items-center justify-center ${statusGradient}`}
        >
          <div
            className={`max-w-7xl px-4 py-[6.625rem] ${statusGlow} sm:px-8 sm:py-32 ${statusGlowMd}`}
          >
            <div className="grid gap-16 text-center">
              <div className="grid gap-4">
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl sm:leading-tight">
                  {statusLetter && (
                    <>
                      <span className="text-amber-600">{statusLetter}</span>{" "}
                    </>
                  )}
                  {event.title}
                </h1>
                {event.linkWebsite && (
                  <div>
                    <a
                      href={event.linkWebsite}
                      className="text-lg font-medium text-amber-600 underline sm:text-xl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Event website
                    </a>
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                <p className="text-2xl font-semibold leading-tight sm:text-3xl sm:leading-tight">
                  {getCountryNameByCode(event.country)}{" "}
                  <span className="text-amber-600">({event.country})</span>
                </p>
                {event.linkLocation && (
                  <div>
                    <a
                      href={event.linkLocation}
                      className="text-lg font-medium text-amber-600 underline sm:text-xl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Location map
                    </a>
                  </div>
                )}
              </div>
              <div className="grid gap-4 text-2xl font-semibold leading-tight sm:text-3xl sm:leading-tight lg:flex lg:justify-center">
                {event.dateStart ? (
                  <>
                    <span>{new Date(event.dateStart).toDateString()}</span>
                    {event.dateEnd !== event.dateStart && (
                      <>
                        <span className="font-normal text-amber-600">
                          &gt;&gt;
                        </span>
                        <span>{new Date(event.dateEnd).toDateString()}</span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-red-600">Missing date info</span>
                )}
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
                className="prose prose-lg prose-amber-basic mx-auto w-full max-w-4xl text-center sm:prose-xl"
                id="description"
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
                  {event.status === enumEventStatus.PUBLISHED && (
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
                  {event.status !== enumEventStatus.PUBLISHED && (
                    <fetcher.Form onSubmit={handlePublishSubmit}>
                      <button
                        disabled={isWorking || event.dateStart === ""}
                        type="submit"
                        className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
                      >
                        Publish
                      </button>
                    </fetcher.Form>
                  )}
                  <fetcher.Form
                    method="post"
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
                  </fetcher.Form>
                </>
              )}
              <button
                disabled={isWorking}
                type="button"
                onClick={() => navigate(-1)}
                className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
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