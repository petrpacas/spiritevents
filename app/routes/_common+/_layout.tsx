import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Footer, Header } from "~/components";
import { authenticator } from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return { isAuthenticated: !!user };
}

export default function MainLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] text-amber-950">
      <Header isAuthenticated={isAuthenticated} />
      <main className="flex justify-center bg-amber-50">
        <div className="grid w-full max-w-7xl grid-rows-1 items-start p-8 max-sm:px-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
