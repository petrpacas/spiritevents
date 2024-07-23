import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useNavigate } from "@remix-run/react";
import { authenticator } from "~/services";

export async function action({ request }: ActionFunctionArgs) {
  const requestUrl = new URL(request.url);
  const ogRoute = requestUrl.searchParams.get("ogRoute");
  return await authenticator.authenticate("form", request, {
    successRedirect: ogRoute || "/",
    failureRedirect: ogRoute ? `/login?ogRoute=${ogRoute}` : "/login",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function Login() {
  const navigate = useNavigate();
  return (
    <Form
      method="post"
      className="mx-auto grid w-full max-w-80 gap-8 text-center"
    >
      <h1 className="text-xl font-bold sm:text-2xl">Sign In</h1>
      <div className="grid gap-4">
        <label className="grid gap-2">
          Email
          <input
            type="email"
            name="email"
            required
            className="w-full rounded border border-neutral-200 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
        </label>
        <label className="grid gap-2">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="w-full rounded border border-neutral-200 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
        </label>
      </div>
      <div className="grid gap-4">
        <button
          type="submit"
          className="rounded border border-transparent bg-amber-700 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          className="rounded border border-amber-700 px-4 py-2 text-amber-700 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
