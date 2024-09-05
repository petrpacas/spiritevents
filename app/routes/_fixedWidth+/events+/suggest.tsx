import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { Bot } from "grammy";
import { useRef } from "react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import slugify from "slugify";
import { descriptionEditorStyles, EventFormFields } from "~/components";
import { authenticator, prisma } from "~/services";
import { EventStatus } from "~/utils";
import { eventFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Suggest a new event ~ SeekGathering" }];
};

export const links: LinksFunction = () => [...descriptionEditorStyles()];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = eventFormSchema.safeParse(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  const categoryIds: string[] = result.data.categories;
  delete result.data.categories;
  await prisma.event.create({
    data: {
      ...result.data,
      categories: { connect: categoryIds.map((id) => ({ id })) },
      status: EventStatus.SUGGESTED,
    },
  });
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    await bot.api.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      `New event suggestion: (${result.data.country}) ${result.data.title}`,
    );
  }
  return redirectWithSuccess("/events", "Much appreciated!");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/events/new",
  });
  const categories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
  });
  return { categories };
}

export default function EventSuggest() {
  const errors = useActionData<typeof action>();
  const { categories } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const submit = useSubmit();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    const dateEnd = formData.get("dateEnd");
    const dateStart = formData.get("dateStart");
    const title = formData.get("title");
    const description = mdxEditorRef.current?.getMarkdown();
    const categories = formData.getAll("category");
    formData.delete("category");
    formData.set("categories", JSON.stringify(categories));
    if (dateStart !== null && dateStart !== "" && dateEnd === "") {
      formData.set("dateEnd", dateStart);
    }
    if (dateEnd !== null && dateEnd !== "" && dateStart === "") {
      formData.set("dateStart", dateEnd);
    }
    formData.set("description", description ?? "");
    formData.set("slug", slugify(String(title), { lower: true, strict: true }));
    submit(formData, { method: "POST" });
  };
  return (
    <Form onSubmit={handleSubmit}>
      <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">
          <svg
            className="h-8 w-8 shrink-0 text-amber-600 max-xl:hidden sm:h-10 sm:w-10"
            width="16px"
            height="16px"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
          <span>Suggest a new event</span>
        </h1>
        <p className="text-lg sm:text-xl">
          Here&apos;s the deal:{" "}
          <em>I&apos;m just one guy and I need your help.</em>
        </p>
        <p className="text-lg sm:text-xl">
          Do you know of any relevant event that deserves to be found by
          like-minded people?
        </p>
        <p className="text-lg text-amber-600 sm:text-xl">
          Suggesting it will not only support the event, but also all the other
          seekers.
        </p>
        <p className="text-lg sm:text-xl">
          If you choose to send a suggestion, I&apos;d like to kindly ask you to
          fill the form below with the event title and the country it&apos;s
          happening in.
        </p>
        <p className="text-lg sm:text-xl">
          If you want to contribute but don&apos;t want to fiddle with the form,
          no worries, go ahead and just reach out through the contacts{" "}
          <button
            type="button"
            className="text-amber-600 underline"
            onClick={() => {
              const el = document.getElementById("contacts");
              if (el) {
                el.scrollIntoView({
                  behavior: "auto",
                  block: "start",
                  inline: "center",
                });
              }
            }}
          >
            in the footer
          </button>
          .
        </p>
        <div className="my-8 border-y border-amber-600 py-8 text-center text-lg font-semibold sm:px-4 sm:text-xl">
          Let&apos;s make this place a true portal together 🌀
        </div>
        <EventFormFields
          isSuggesting
          categories={categories}
          errors={errors}
          mdxEditorRef={mdxEditorRef}
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Suggest
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
