import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useNavigation,
  useRouteLoaderData,
} from "@remix-run/react";
import NProgress from "nprogress";
import { useEffect, useMemo } from "react";
import { toast as showToast, Toaster } from "react-hot-toast";
import { getToast } from "remix-toast";
import styles from "./tailwind.css?url";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  const { pathname, search } = new URL(request.url);
  if (pathname.endsWith("/") && pathname !== "/") {
    throw redirect(`${pathname.slice(0, -1)}${search}`, 301);
  }
  if (toast && headers) {
    return json({ toast }, { headers });
  } else {
    return null;
  }
};

export function Layout({ children }: { children: React.ReactNode }) {
  const fetchers = useFetchers();
  const navigation = useNavigation();
  const data = useRouteLoaderData<typeof loader>("root");
  const state = useMemo<"idle" | "working">(
    function getGlobalState() {
      const states = [
        navigation.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) {
        return "idle";
      }
      return "working";
    },
    [navigation.state, fetchers],
  );
  useEffect(() => {
    if (state === "working") {
      NProgress.start();
    }
    if (state === "idle") {
      NProgress.done();
    }
  }, [state]);
  useEffect(() => {
    if (data?.toast) {
      switch (data.toast.type) {
        case "success":
          showToast.success(data.toast.message);
          break;
        case "error":
          showToast.error(data.toast.message);
          break;
        default:
          showToast(data.toast.message);
          break;
      }
    }
  }, [data?.toast]);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fffbeb"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#451a03"
        />
        <meta
          name="msapplication-navbutton-color"
          media="(prefers-color-scheme: light)"
          content="#fffbeb"
        />
        <meta
          name="msapplication-navbutton-color"
          media="(prefers-color-scheme: dark)"
          content="#451a03"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          media="(prefers-color-scheme: light)"
          content="#fffbeb"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          media="(prefers-color-scheme: dark)"
          content="#451a03"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:image"
          content="https://seekgathering.com/logo.png"
        />
        <Meta />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png?v=2024-08-08"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png?v=2024-08-08"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?v=2024-08-08"
        />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="/favicon.ico?v=2024-08-08"
        />
        <link rel="manifest" href="/site.webmanifest" />
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
      <body className="relative bg-white text-amber-950 dark:bg-stone-700 dark:text-white">
        {children}
        <Toaster
          toastOptions={{
            className:
              "!bg-stone-800 !text-white dark:!bg-white dark:!text-amber-950",
            duration: 3333,
            position: "bottom-center",
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
