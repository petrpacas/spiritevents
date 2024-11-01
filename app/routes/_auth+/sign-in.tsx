import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { authenticator, commitSession, getSession } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "Sign in ~ SpiritEvents.cz" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const requestUrl = new URL(request.url);
  const originRoute = requestUrl.searchParams.get("originRoute");
  return await authenticator.authenticate("FormStrategy", request, {
    failureRedirect: originRoute
      ? `/sign-in?originRoute=${originRoute}`
      : "/sign-in",
    successRedirect: originRoute || "/events",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  const session = await getSession(request.headers.get("cookie"));
  const error = session.get(authenticator.sessionErrorKey);
  return json(
    { error },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
}

export default function SignIn() {
  const { error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  return (
    <div className="mx-auto grid w-full max-w-7xl px-4 py-8 sm:px-8">
      <Form
        replace
        method="post"
        className="w-full max-w-80 place-self-center text-center"
      >
        <fieldset className="grid gap-8" disabled={navigation.state !== "idle"}>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl sm:leading-snug">
            Sign in
          </h1>
          <div className="grid gap-4">
            <label className="grid gap-2">
              Email
              <input
                autoComplete="off"
                type="email"
                name="email"
                required
                className="w-full rounded border border-stone-300 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-950"
              />
            </label>
            <label className="grid gap-2">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="w-full rounded border border-stone-300 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-950"
              />
            </label>
            {error?.message && <p className="text-red-600">{error.message}</p>}
          </div>
          <div className="grid gap-4">
            <button
              type="submit"
              className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50 dark:border-white dark:text-white"
            >
              Back
            </button>
          </div>
        </fieldset>
      </Form>
    </div>
  );
}
