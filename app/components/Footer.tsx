import { Form, Link, useLocation } from "@remix-run/react";

type Props = {
  isAuthenticated: boolean;
};

export const Footer = ({ isAuthenticated }: Props) => {
  const location = useLocation();
  let signInUrl = "";
  if (location.pathname === "/" || location.pathname === "/sign-in") {
    signInUrl = "/sign-in" + location.search;
  } else {
    signInUrl = "/sign-in?ogRoute=" + location.pathname + location.search;
  }
  return (
    <footer className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 text-center sm:px-8 sm:py-16">
        <div className="text-gray-500">
          made by <a href="mailto:petr@pacas.cz">@petrpacas</a>
        </div>
        {isAuthenticated ? (
          <Form action="/sign-out" method="post">
            <button
              type="submit"
              className="absolute bottom-0 left-0 inline-flex items-center gap-2 rounded-tr border-r border-t border-gray-200 px-4 py-2 text-gray-500 shadow-sm transition-shadow hover:shadow-md active:shadow"
            >
              <span className="max-sm:sr-only">Logout</span>
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
        ) : (
          <Link
            to={signInUrl}
            className="absolute bottom-0 left-0 inline-flex items-center gap-2 rounded-tr border-r border-t border-gray-200 px-4 py-2 text-gray-500 shadow-sm transition-shadow hover:shadow-md active:shadow"
          >
            <span className="max-sm:sr-only">Admin login</span>
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
      </div>
    </footer>
  );
};
