import * as Sentry from "@sentry/remix";

export function init() {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    tracesSampleRate: 1,
  });
}
