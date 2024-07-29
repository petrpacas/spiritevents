import type { LoaderFunctionArgs } from "@remix-run/node";
import bcrypt from "@node-rs/bcrypt";
import { UserRole } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import prisma from "./db.server";

type EmailPassword = {
  email: string;
  password: string;
};

export async function login({ email, password }: EmailPassword) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) return null;
  return user;
}

export async function register({ email, password }: EmailPassword) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: passwordHash, role: UserRole.USER },
  });
  if (!user) return null;
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    name: "seek_gathering_session",
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function requireUserSession(
  request: LoaderFunctionArgs["request"],
) {
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);
  if (!session.has("user")) {
    const requestUrl = new URL(request.url);
    throw redirect(`/sign-in?ogRoute=${requestUrl.pathname}`);
  }
  return session;
}
