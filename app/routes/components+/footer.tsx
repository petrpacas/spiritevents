import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useFetcher, useLocation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { inferFlattenedErrors } from "zod";
import { prisma } from "~/services";
import { subscriberFormSchema } from "~/validations";

type Props = {
  isAuthenticated: boolean;
};

type ActionData = {
  errors?: inferFlattenedErrors<typeof subscriberFormSchema>;
  success: boolean;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await subscriberFormSchema.safeParseAsync(data);
  if (!result.success) {
    return { errors: result.error.flatten() };
  }
  await prisma.subscriber.create({ data: result.data });
  return { success: true };
}

export const Footer = ({ isAuthenticated }: Props) => {
  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;
  const { pathname, search } = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (actionData?.success) {
      formRef.current?.reset();
    }
  }, [actionData?.success]);
  let signInUrl = "";
  if (pathname === "/" || pathname === "/sign-in") {
    signInUrl = "/sign-in" + search;
  } else {
    signInUrl = "/sign-in?ogRoute=" + pathname + search;
  }
  return (
    <footer className="bg-stone-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-16">
        <div className="grid items-start gap-16 xl:grid-cols-3">
          <div className="grid items-start gap-8 xl:col-span-2 xl:grid-cols-2 xl:gap-x-16">
            <h2 className="text-2xl sm:text-3xl xl:col-span-2">
              🔄 Stay in the <strong>loop</strong>
            </h2>
            <div className="grid gap-4 text-lg sm:text-xl">
              <p>
                Don&apos;t expect to get any email from me anytime soon, but if
                and when one goes out, it could be really worth your while!
              </p>
              <p className="text-amber-600">
                (By joining you agree to receive the newsletter,
                obviously&hellip;)
              </p>
            </div>
            <fetcher.Form
              method="post"
              action="/components/footer"
              ref={formRef}
              className="grid gap-2 self-start sm:max-[829px]:grid-cols-2 min-[830px]:max-xl:grid-cols-3"
            >
              <input
                placeholder="Name (optional)"
                type="text"
                name="name"
                className="w-full rounded-lg border-stone-200 py-2 text-lg shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-4"
              />
              <input
                required
                placeholder="Email"
                type="email"
                name="email"
                className="w-full rounded-lg border-stone-200 py-2 text-lg shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-4"
              />
              {actionData?.errors?.fieldErrors.name && (
                <p className="text-center text-red-600 sm:max-[829px]:col-span-2 min-[830px]:max-xl:order-4 min-[830px]:max-xl:col-span-3">
                  {actionData.errors.fieldErrors.name.join(", ")}
                </p>
              )}
              {actionData?.errors?.fieldErrors.email && (
                <p className="text-center text-red-600 sm:max-[829px]:col-span-2 min-[830px]:max-xl:order-4 min-[830px]:max-xl:col-span-3">
                  {actionData.errors.fieldErrors.email.join(", ")}
                </p>
              )}
              <button
                type="submit"
                className="flex items-center justify-center gap-4 rounded-lg border border-transparent bg-amber-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-4 sm:max-[829px]:col-span-2 xl:px-8"
              >
                Join the mailing list
                <svg
                  className="h-6 w-6 max-[339px]:hidden"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </button>
            </fetcher.Form>
          </div>
          <div className="grid gap-8 text-center xl:text-left">
            <h2 className="text-2xl font-bold max-[319px]:grid sm:text-3xl">
              👋 <span className="text-amber-600">Seek</span>Gathering
            </h2>
            <div className="grid gap-2">
              <a
                href="mailto:info@seekgathering.com"
                className="text-amber-600 underline"
              >
                info@seekgathering.com
              </a>
              <a
                href="https://instagram.com/seekgathering"
                className="text-amber-600 underline"
              >
                instagram
                <span className="max-[319px]:sr-only">.com/seekgathering</span>
              </a>
              <a
                href="https://facebook.com/seekgatheringcom"
                className="text-amber-600 underline"
              >
                facebook
                <span className="max-[319px]:sr-only">
                  .com/seekgatheringcom
                </span>
              </a>
            </div>
            <div>
              Made with 💛 by{" "}
              <a
                href="mailto:petr@pacas.cz"
                className="text-amber-600 underline"
              >
                petr@pacas.cz
              </a>
            </div>
            {isAuthenticated ? (
              <Form
                action="/sign-out"
                method="post"
                className="justify-self-center xl:justify-self-start"
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded border border-stone-200 px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow"
                >
                  Admin logout
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
                className="inline-flex items-center gap-2 justify-self-center rounded border border-stone-200 px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow xl:justify-self-start"
              >
                Admin login
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
        </div>
      </div>
    </footer>
  );
};
