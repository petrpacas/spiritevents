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
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
          <Link to="/" className="font-serif text-4xl uppercase">
            S<span className="max-sm:sr-only">eek </span>G
            <span className="max-sm:sr-only">athering</span>
          </Link>
          {user ? (
            <nav className="flex items-center gap-4">
              <Link
                to="/events/new"
                className="rounded bg-amber-900 px-4 py-2 text-white hover:shadow-md active:shadow"
              >
                Add New Event
              </Link>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="rounded border border-amber-900 px-4 py-2 text-amber-900 hover:shadow-md active:shadow"
                >
                  Log Out
                </button>
              </Form>
            </nav>
          ) : (
            <Link
              to="/login"
              className="rounded border border-amber-900 px-4 py-2 text-amber-900 hover:shadow-md active:shadow"
            >
              Admin
            </Link>
          )}
        </header>
        <main className="bg-amber-50 text-neutral-950">
          <div className="mx-auto w-full max-w-7xl p-8">{children}</div>
        </main>
        <footer className="mx-auto w-full max-w-7xl p-8 text-center">
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
