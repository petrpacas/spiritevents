import type { User } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";
import { login, sessionStorage } from "./session.server";

export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    invariant(typeof email === "string", "Email must be a string");
    invariant(email.length > 0, "Email must not be empty");
    invariant(typeof password === "string", "Password must be a string");
    invariant(password.length > 0, "Password must not be empty");
    const user = await login({ email, password });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return user;
  }),
  "FormStrategy",
);
