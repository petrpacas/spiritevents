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
    <Form method="post" className="mx-auto grid max-w-lg gap-8 text-center">
      <h1 className="text-4xl">Log In</h1>
      <div className="grid gap-4">
        <label className="grid gap-2">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
          />
        </label>
        <label className="grid gap-2">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
          />
        </label>
      </div>
      <div className="flex justify-center gap-4">
        <button
          type="submit"
          className="rounded bg-amber-600 px-4 py-2 text-white hover:shadow-md active:shadow"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          className="rounded border border-amber-600 bg-white px-4 py-2 text-amber-600 hover:shadow-md active:shadow"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
