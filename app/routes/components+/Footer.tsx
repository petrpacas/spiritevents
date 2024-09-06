import type { ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { inferFlattenedErrors } from "zod";
import { prisma } from "~/services";
import { subscriberFormSchema } from "~/validations";

type Props = {
  isAuthenticated: boolean;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = await subscriberFormSchema.safeParseAsync(data);
  if (!result.success) {
    return jsonWithError(
      { errors: result.error.flatten() },
      "Please fix the errors",
    );
  }
  const { email, name } = result.data;
  await prisma.subscriber.upsert({
    create: { email, name },
    update: { name },
    where: { email },
  });
  return jsonWithSuccess({ success: true }, "Welcome on board!");
}

export const Footer = ({ isAuthenticated }: Props) => {
  type ActionData = {
    errors?: inferFlattenedErrors<typeof subscriberFormSchema>;
    success: boolean;
  };
  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;
  const { pathname, search } = useLocation();
  const navigation = useNavigation();
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
    <footer className="bg-stone-100">
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-4 py-8 sm:px-8 sm:py-16">
        <div className="grid items-start gap-16 xl:grid-cols-3">
          <div className="grid items-start gap-8 xl:col-span-2 xl:grid-cols-2 xl:gap-x-16">
            <h3 className="text-2xl leading-snug sm:text-3xl sm:leading-snug xl:col-span-2">
              🔄 Stay in the <strong>loop</strong>
            </h3>
            <div className="grid gap-4">
              <p className="text-lg sm:text-xl">
                Don&apos;t expect to get any email from me anytime soon, but if
                and when one goes out, it could be really{" "}
                <em>worth your while to be in the list</em>!
              </p>
              <p className="text-amber-600 sm:text-lg">
                (By joining you agree to receive the potential newsletter,
                legally speaking.)
              </p>
            </div>
            <fetcher.Form
              action="/components/Footer"
              method="post"
              ref={formRef}
            >
              <fieldset
                disabled={fetcher.state !== "idle"}
                className="grid gap-2 self-start sm:max-[839px]:grid-cols-2 min-[840px]:max-xl:grid-cols-3"
              >
                <input
                  placeholder="Name (optional)"
                  autoComplete="on"
                  type="text"
                  name="name"
                  className="w-full rounded-lg border-stone-300 py-2 text-lg placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-4"
                />
                <input
                  required
                  placeholder="Email"
                  autoComplete="on"
                  type="email"
                  name="email"
                  className="w-full rounded-lg border-stone-300 py-2 text-lg placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow sm:py-4"
                />
                {actionData?.errors?.fieldErrors.name && (
                  <p className="text-center text-red-600 sm:max-[839px]:col-span-2 min-[840px]:max-xl:order-4 min-[840px]:max-xl:col-span-3">
                    {actionData.errors.fieldErrors.name.join(", ")}
                  </p>
                )}
                {actionData?.errors?.fieldErrors.email && (
                  <p className="text-center text-red-600 sm:max-[839px]:col-span-2 min-[840px]:max-xl:order-4 min-[840px]:max-xl:col-span-3">
                    {actionData.errors.fieldErrors.email.join(", ")}
                  </p>
                )}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-3 rounded-lg border border-transparent bg-amber-600 px-4 py-2 text-lg text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 sm:py-4 sm:max-[839px]:col-span-2 xl:px-8"
                >
                  Join the mailing list
                  <svg
                    className="h-6 w-6 max-[339px]:hidden"
                    width="16px"
                    height="16px"
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
              </fieldset>
            </fetcher.Form>
          </div>
          <div className="grid gap-8 text-center xl:text-left" id="contacts">
            <h3 className="text-2xl font-bold leading-snug sm:text-3xl sm:leading-snug">
              👋 <span className="text-amber-600">Seek</span>Gathering
            </h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div>
                  <a
                    href="mailto:info@seekgathering.com"
                    className="break-all text-lg leading-snug text-amber-600 underline sm:text-xl sm:leading-snug"
                  >
                    info@seekgathering.com
                  </a>
                </div>
                <div>
                  <a
                    href="https://instagram.com/seekgathering"
                    className="text-lg leading-snug text-amber-600 underline sm:text-xl sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    instagram
                  </a>
                </div>
                <div>
                  <a
                    href="https://facebook.com/seekgatheringcom"
                    className="text-lg leading-snug text-amber-600 underline sm:text-xl sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    facebook
                  </a>
                </div>
              </div>
              <div className="max-[399px]:grid">
                Cover photo by{" "}
                <a
                  href="https://www.elizabethgottwald.com/"
                  className="text-amber-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Elizabeth Gottwald
                </a>
              </div>
              {isAuthenticated ? (
                <Form action="/sign-out" method="post">
                  <button
                    disabled={navigation.state !== "idle"}
                    type="submit"
                    className="inline-flex items-center gap-3 justify-self-center rounded border border-stone-300 px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 xl:justify-self-start"
                  >
                    Admin sign out
                    <svg
                      className="h-5 w-5"
                      width="16px"
                      height="16px"
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
                  className="inline-flex items-center gap-3 justify-self-center rounded border border-stone-300 px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md active:shadow xl:justify-self-start"
                >
                  Admin sign in
                  <svg
                    className="h-5 w-5"
                    width="16px"
                    height="16px"
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
                    ></path>
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="grid items-center justify-center gap-8 text-center">
          <div className="max-[399px]:grid">
            Made with 💛 by{" "}
            <a href="https://pacas.cz/" className="text-amber-600 underline">
              Petr Pacas
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
