import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { authenticator } from "~/services";
import "./tailwind.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return !!user;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const user = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-amber-100 text-amber-900">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between p-4 sm:px-8">
          <Link to="/" className="font-serif text-4xl uppercase">
            S<span className="max-sm:sr-only">eek </span>G
            <span className="max-sm:sr-only">athering</span>
          </Link>
          {user ? (
            <nav className="flex items-center gap-4">
              <Link
                to="/events/new"
                className="flex items-center gap-2 rounded border border-transparent bg-amber-800 px-4 py-2 text-white hover:shadow-md active:shadow"
              >
                <span className="max-sm:sr-only">Add New Event</span>
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
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded border border-amber-800 px-4 py-2 text-amber-900 hover:shadow-md active:shadow"
                >
                  <span className="max-sm:sr-only">Log Out</span>
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
              to="/login"
              className="flex items-center gap-2 rounded border border-amber-800 px-4 py-2 text-amber-900 hover:shadow-md active:shadow"
            >
              <span className="max-sm:sr-only">Log In</span>
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
        <main className="bg-amber-50 text-neutral-950">
          <div className="mx-auto w-full max-w-7xl p-8 max-sm:px-4">
            {children}
          </div>
        </main>
        <footer className="mx-auto w-full max-w-7xl p-8 text-center max-sm:px-4">
          Made with ❤️ by <a href="mailto:petr@pacas.cz">Petr Pacas</a>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
