import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { Footer, Header } from "~/components";
import { authenticator } from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return { isAuthenticated: !!user };
}

export default function FixedWidthLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="grid min-h-lvh grid-rows-[auto_1fr_auto]">
      <Header isAuthenticated={isAuthenticated} key={pathname} />
      <main className="flex justify-center">
        <div className="grid w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
          <Outlet />
        </div>
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
