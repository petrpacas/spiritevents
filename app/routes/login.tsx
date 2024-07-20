import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useNavigate } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

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
    <>
      <h1 className="mb-8 text-4xl">Log In</h1>
      <Form method="post">
        <div className="mb-8 grid gap-4">
          <label className="grid gap-2">
            email
            <input type="email" name="email" required />
          </label>
          <label className="grid gap-2">
            password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded bg-amber-600 px-4 py-2 text-white"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            className="rounded border border-amber-600 bg-white px-4 py-2 text-amber-600"
          >
            Cancel
          </button>
        </div>
      </Form>
    </>
  );
}
