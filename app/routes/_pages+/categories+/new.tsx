import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { CategoryFormFields } from "~/components";
import { prisma, requireUserSession } from "~/services";
import { categoryFormSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "Add a new category ~ SpiritEvents.cz" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await categoryFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(result.error.flatten(), "Please fix the errors");
  }
  await prisma.category.create({
    data: result.data,
  });
  return redirectWithSuccess("/categories", "Category saved");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return null;
}

export default function CategoryNew() {
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const formData = new FormData($form);
    submit(formData, { method: "POST" });
  };
  return (
    <div className="mx-auto grid w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
      <div className="grid gap-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">
          <svg
            className="h-8 w-8 shrink-0 text-amber-600 max-xl:hidden sm:h-10 sm:w-10"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>Add a new category</span>
        </h1>
        <Form onSubmit={handleSubmit}>
          <fieldset
            className="grid gap-4"
            disabled={navigation.state !== "idle"}
          >
            <CategoryFormFields errors={errors} />
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm hover:shadow-md active:shadow disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm hover:shadow-md active:shadow disabled:opacity-50 dark:border-white dark:text-white"
              >
                Back
              </button>
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  );
}
