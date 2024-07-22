import type { LoaderFunctionArgs } from "@remix-run/node";
import bcrypt from "@node-rs/bcrypt";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { prisma } from "~/services";

type LoginForm = {
  email: string;
  password: string;
};

export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) return null;
  return user;
}

// export async function register({ email, password }: LoginForm) {
//   const passwordHash = await bcrypt.hash(password, 10);
//   const user = await prisma.user.create({
//     data: { email, password: passwordHash, isAdmin: false },
//   });
//   if (!user) return null;
//   return user;
// }

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "seek_gathering_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function requireUserSession(
  request: LoaderFunctionArgs["request"],
) {
  const cookie = request.headers.get("cookie");
  const session = await sessionStorage.getSession(cookie);
  if (!session.has("user")) {
    const requestUrl = new URL(request.url);
    throw redirect(`/login?ogRoute=${requestUrl.pathname}`);
  }
  return session;
}
