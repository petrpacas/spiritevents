import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { Header } from "~/components";
import { Footer } from "~/routes/resources+";
import { authenticator } from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return { isAuthenticated: !!user };
}

export default function FullWidthLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="grid">
      <Header isAuthenticated={isAuthenticated} isLanding key={pathname} />
      <main>
        <Outlet />
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
