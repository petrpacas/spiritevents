import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  redirect,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
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
      await prisma.event.delete({ where: { slug: params.id } });
      return redirect("/events");
    case "draft":
      await prisma.event.update({
        data: { status: enumEventStatus.DRAFT },
        where: { slug: params.id },
      });
      break;
    case "publish":
      await prisma.event.update({
        data: { status: enumEventStatus.PUBLISHED },
        where: { slug: params.id },
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
      slug: params.id,
      status: user ? undefined : enumEventStatus.PUBLISHED,
    },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  return { event, isAuthenticated: !!user };
}

export default function Event() {
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
                      rel="noreferrer"
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
                      rel="noreferrer"
                    >
                      Location map
                    </a>
                  </div>
                )}
              </div>
              <div className="grid gap-4 text-2xl font-semibold leading-tight sm:text-3xl sm:leading-tight lg:flex lg:justify-center">
                <span>{new Date(event.dateStart).toDateString()}</span>
                {event.dateEnd !== event.dateStart && (
                  <>
                    <span className="text-amber-600">&gt;&gt;</span>
                    <span>{new Date(event.dateEnd).toDateString()}</span>
                  </>
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
                className="prose prose-lg prose-amber-basic mx-auto w-full text-center sm:prose-xl"
                id="description"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(event.description),
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
                      className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </Form>
                  {event.status === enumEventStatus.PUBLISHED && (
                    <Form
                      replace
                      method="post"
                      onSubmit={(event) => {
                        const response = confirm(
                          "Do you really want to make the event a draft?",
                        );
                        if (!response) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <button
                        disabled={isWorking}
                        type="submit"
                        name="intent"
                        value="draft"
                        className="rounded border border-transparent bg-stone-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
                      >
                        Draft
                      </button>
                    </Form>
                  )}
                  {event.status !== enumEventStatus.PUBLISHED && (
                    <Form
                      replace
                      method="post"
                      onSubmit={(event) => {
                        const response = confirm(
                          "Do you really want to publish the event?",
                        );
                        if (!response) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <button
                        disabled={isWorking}
                        type="submit"
                        name="intent"
                        value="publish"
                        className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
                      >
                        Publish
                      </button>
                    </Form>
                  )}
                  <Form
                    replace
                    method="post"
                    onSubmit={(event) => {
                      const response = confirm(
                        "Do you really want to delete the event?",
                      );
                      if (!response) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <button
                      disabled={isWorking}
                      type="submit"
                      name="intent"
                      value="delete"
                      className="rounded border border-transparent bg-red-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
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
                className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:cursor-wait disabled:opacity-50"
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
