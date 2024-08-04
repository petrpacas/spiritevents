import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { authenticator, commitSession, getSession } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "Sign in ~ SeekGathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const requestUrl = new URL(request.url);
  const ogRoute = requestUrl.searchParams.get("ogRoute");
  return await authenticator.authenticate("FormStrategy", request, {
    failureRedirect: ogRoute ? `/sign-in?ogRoute=${ogRoute}` : "/sign-in",
    successRedirect: ogRoute || "/events",
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
  return (
    <Form
      method="post"
      className="grid w-full max-w-80 gap-8 place-self-center text-center"
    >
      <h1 className="text-xl font-bold sm:text-2xl">Sign in</h1>
      <div className="grid gap-4">
        <label className="grid gap-2">
          Email
          <input
            type="email"
            name="email"
            required
            className="w-full rounded border border-stone-200 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
        </label>
        <label className="grid gap-2">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="w-full rounded border border-stone-200 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
        </label>
        {error?.message && <p className="text-red-600">{error.message}</p>}
      </div>
      <div className="grid gap-4">
        <button
          type="submit"
          className="rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-amber-600 px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
