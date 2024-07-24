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
        S<span className="max-sm:sr-only">eek&nbsp;</span>G
        <span className="max-sm:sr-only">athering</span>
      </Link>
      {isAuthenticated ? (
        <nav className="flex items-center gap-4">
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
              <span className="max-sm:sr-only">Sign out</span>
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
        </nav>
      ) : (
        <Link
          to={signInUrl}
          className="flex items-center gap-2 rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          <span className="max-sm:sr-only">Sign in</span>
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
      )}
    </header>
  );
};
