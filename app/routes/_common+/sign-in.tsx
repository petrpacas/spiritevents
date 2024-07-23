import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, useNavigate } from "@remix-run/react";
import { authenticator } from "~/services";

export const meta: MetaFunction = () => {
  return [{ title: "Sign in ~ Seek Gathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const requestUrl = new URL(request.url);
  const ogRoute = requestUrl.searchParams.get("ogRoute");
  return await authenticator.authenticate("form", request, {
    failureRedirect: ogRoute ? `/sign-in?ogRoute=${ogRoute}` : "/sign-in",
    successRedirect: ogRoute || "/",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function SignIn() {
  const navigate = useNavigate();
  return (
    <Form
      method="post"
      className="grid w-full max-w-80 gap-8 self-center justify-self-center text-center"
    >
      <h1 className="text-xl font-bold sm:text-2xl">
        Sign in to S<span className="sr-only">eek&nbsp;</span>G
        <span className="sr-only">athering</span>
      </h1>
      <div className="grid gap-4">
        <label className="grid gap-2">
          Email
          <input
            type="email"
            name="email"
            required
            className="w-full rounded border border-neutral-200 bg-white px-4 py-2 shadow-sm transition-shadow autofill:!bg-amber-100 hover:shadow-md active:shadow"
          />
        </label>
        <label className="grid gap-2">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="w-full rounded border border-neutral-200 bg-white px-4 py-2 shadow-sm transition-shadow autofill:!bg-amber-100 hover:shadow-md active:shadow"
          />
        </label>
      </div>
      <div className="grid gap-4">
        <button
          type="submit"
          className="rounded border border-transparent bg-amber-800 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          className="rounded border border-amber-800 px-4 py-2 text-amber-800 shadow-sm transition-shadow hover:shadow-md active:shadow"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
