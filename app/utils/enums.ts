import type {
  EventStatus as EventStatus,
  UserRole as UserRole,
} from "@prisma/client";

export const enumEventStatus: { [K in EventStatus]: K } = {
  DRAFT: "DRAFT",
  SUGGESTED: "SUGGESTED",
  PUBLISHED: "PUBLISHED",
};

export const enumUserRole: { [K in UserRole]: K } = {
  ADMIN: "ADMIN",
  USER: "USER",
};
