import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { jsonWithSuccess } from "remix-toast";
import { prisma, requireUserSession } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "All categories ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const id = data.id;
  if (typeof id === "string") {
    await prisma.category.delete({ where: { id } });
    return jsonWithSuccess("/categories", "Category deleted");
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const allCategories = await prisma.category.findMany({
    orderBy: { slug: "asc" },
    include: { _count: true },
  });
  return { allCategories };
}

export default function Feedback() {
  const { allCategories } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isWorking = fetcher.state !== "idle";
  return (
    <div className="grid gap-8">
      <h1 className="flex items-center gap-2 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">
        <svg
          className="h-8 w-8 shrink-0 text-amber-600 max-xl:hidden sm:h-10 sm:w-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6h.008v.008H6V6Z"
          />
        </svg>
        <span>All categories</span>
      </h1>
      {allCategories.length > 0 ? (
        <div className="grid gap-4 sm:flex sm:flex-wrap">
          {allCategories.map((category) => (
            <div key={category.id} className="flex">
              <Link
                to={`/categories/${category.slug}-${category.id}/edit`}
                className="flex flex-grow rounded-l border border-r-0 border-amber-600 p-2 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
              >
                <div className="grid gap-2 sm:flex sm:flex-grow">
                  {category.slug}
                  <span className="text-amber-600">({category.name})</span>(
                  {category._count.events}x)
                </div>
              </Link>
              <fetcher.Form
                className="flex"
                method="post"
                onSubmit={(e) => {
                  const response = confirm(
                    "Do you really want to delete the category?",
                  );
                  if (!response) {
                    e.preventDefault();
                  }
                }}
              >
                <button
                  disabled={isWorking}
                  type="submit"
                  name="id"
                  value={category.id}
                  className="rounded-r border border-red-600 bg-red-50 px-2 text-red-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:bg-red-950"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </fetcher.Form>
            </div>
          ))}
        </div>
      ) : (
        <p className="my-4 justify-self-center border-y border-amber-600 py-4 text-xl italic sm:my-8 sm:px-4 sm:py-8 sm:text-2xl">
          No category yet&hellip;
        </p>
      )}

      <div className="flex justify-end gap-4">
        <Link
          to="/categories/new"
          className="rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
        >
          New
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:text-white"
        >
          Back
        </button>
      </div>
    </div>
  );
}
