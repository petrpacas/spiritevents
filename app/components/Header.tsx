import { Form, Link, useLocation } from "@remix-run/react";

type Props = {
  isAuthenticated: boolean;
  isHomepage?: boolean;
};

export const Header = ({ isAuthenticated, isHomepage }: Props) => {
  const location = useLocation();
  let signInUrl = "";
  if (location.pathname === "/" || location.pathname === "/sign-in") {
    signInUrl = "/sign-in" + location.search;
  } else {
    signInUrl = "/sign-in?ogRoute=" + location.pathname + location.search;
  }
  return (
    <header
      className={
        isHomepage
          ? "flex w-full items-center justify-between"
          : "mx-auto flex w-full max-w-7xl items-center justify-between p-4 sm:px-8"
      }
    >
      <Link to="/" className="font-serif text-4xl uppercase">
        S<span className="max-md:sr-only">eek&nbsp;</span>G
        <span className="max-md:sr-only">athering</span>
      </Link>
      <nav className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/events/new"
              className="flex items-center gap-2 rounded border border-transparent bg-amber-800 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
            >
              <span className="max-sm:sr-only">Add new event</span>
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Link>
            <Form action="/sign-out" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
              >
                <span className="max-sm:sr-only">Exit</span>
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
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
              </button>
            </Form>
          </>
        ) : (
          <>
            <Link
              to="/events/suggest"
              className="flex items-center gap-2 rounded border border-transparent bg-amber-800 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
            >
              <span className="max-sm:sr-only">Suggest an event</span>
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
                  d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                />
              </svg>
            </Link>
            <Link
              to={signInUrl}
              className="flex items-center gap-2 rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
            >
              <span className="max-sm:sr-only">Admin</span>
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
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
