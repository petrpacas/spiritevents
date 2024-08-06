import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import NProgress from "nprogress";
import { useEffect, useMemo } from "react";
import { toast as showToast, Toaster } from "react-hot-toast";
import { getToast } from "remix-toast";
import "./tailwind.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  const { pathname, search } = new URL(request.url);
  if (pathname.endsWith("/") && pathname !== "/") {
    throw redirect(`${pathname.slice(0, -1)}${search}`, 301);
  }
  return json({ toast }, { headers });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const state = useMemo<"idle" | "working">(
    function getGlobalState() {
      const states = [
        navigation.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "working";
    },
    [navigation.state, fetchers],
  );
  useEffect(() => {
    if (state === "working") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state]);
  useEffect(() => {
    if (toast) {
      switch (toast.type) {
        case "success":
          showToast.success(toast.message);
          break;
        case "error":
          showToast.error(toast.message);
          break;
        default:
          showToast(toast.message);
          break;
      }
    }
  }, [toast]);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <link rel="icon" href="/favicon.ico?v=2024-08-04" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <Links />
      </head>
      <body className="relative text-amber-950">
        {children}
        <Toaster toastOptions={{ className: "!text-amber-950" }} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
