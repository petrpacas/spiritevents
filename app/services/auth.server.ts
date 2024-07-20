import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { login, sessionStorage } from "~/services/session.server";
import { User } from "@prisma/client";
import invariant from "tiny-invariant";

export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    invariant(typeof email === "string", "email must be a string");
    invariant(email.length > 0, "email must not be empty");
    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");
    const user = await login({ email, password });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return user;
  })
);
