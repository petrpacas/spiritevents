import { Link, useNavigate } from "@remix-run/react";

export const meta = () => {
  return [{ title: "Page not found ~ SeekGathering" }];
};

export function loader() {
  return new Response("Not Found", {
    status: 404,
  });
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="grid gap-8">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <span>Requested page was not found</span>
      </h1>
      <p className="text-lg sm:text-xl">
        Not sure what happened there&hellip; Probably a bad link, eh?
      </p>
      <div className="flex justify-end gap-4">
        <Link
          to="/"
          className="rounded border border-amber-600 bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Go to homepage
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow dark:text-white"
        >
          Back
        </button>
      </div>
    </div>
  );
}
