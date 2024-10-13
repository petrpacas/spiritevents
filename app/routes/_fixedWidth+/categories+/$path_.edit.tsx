import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { CategoryFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { categoryFormSchema } from "~/validations";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.category?.name} ~ SpiritEvents.cz` }];
};

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const id = params.path?.slice(0, 8);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await categoryFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  delete result.data.originName;
  delete result.data.originSlug;
  await prisma.category.update({
    data: result.data,
    where: { id },
  });
  return redirectWithSuccess("/categories", "Category saved");
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const id = params.path?.slice(0, 8);
  const dashAndSlug = params.path?.slice(8);
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }
  if (`-${category.slug}` !== dashAndSlug) {
    throw redirect(`/categories/${id}-${category.slug}/edit`, 301);
  }
  return { category };
}

export default function CategoryEdit() {
  const errors = useActionData<typeof action>();
  const { category } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    formData.set("originName", category.name);
    formData.set("originSlug", category.slug);
    submit(formData, { method: "POST", replace: true });
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          <span>Editing {category.name}</span>
        </h1>
        <CategoryFormFields category={category} errors={errors} />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:border-white dark:text-white"
          >
            Back
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
