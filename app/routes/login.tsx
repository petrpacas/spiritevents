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
      <h1 className="text-4xl mb-8">Log In</h1>
      <Form method="post">
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex flex-col gap-2">
            email
            <input
              type="email"
              name="email"
              required
              className="bg-orange-50"
            />
          </label>
          <label className="flex flex-col gap-2">
            password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="bg-orange-50"
            />
          </label>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <button type="submit">Log In</button>
          <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
          >
            Cancel
          </button>
        </div>
      </Form>
    </>
  );
}
