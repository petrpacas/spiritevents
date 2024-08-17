import type { EventStatus as originEventStatus } from "@prisma/client";

export const EventStatus: { [K in originEventStatus]: K } = {
  DRAFT: "DRAFT",
  SUGGESTED: "SUGGESTED",
  PUBLISHED: "PUBLISHED",
};

export type EventStatus = originEventStatus;
