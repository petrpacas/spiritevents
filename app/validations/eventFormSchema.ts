import slugify from "slugify";
import { z } from "zod";
import { prisma } from "~/services";
import { getTodayDate } from "~/utils";

const fields = z
  .object({
    country: z.string().trim().length(2, "Country must be selected"),
    description: z.string().trim().or(z.literal("")),
    linkLocation: z.string().url().or(z.literal("")),
    linkWebsite: z.string().url().or(z.literal("")),
    ogSlug: z.string().optional(),
    slug: z
      .string()
      .trim()
      .transform((value) =>
        slugify(value, {
          lower: true,
          strict: true,
        }),
      )
      .superRefine((value, ctx) => {
        if (value.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Slug must contain at least 2 characters",
            fatal: true,
          });
          return z.NEVER;
        }
      }),
    title: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s+/g, " "))
      .superRefine((value, ctx) => {
        if (value.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Title must contain at least 2 characters",
          });
        }
      }),
  })
  .superRefine(async (data, ctx) => {
    const { ogSlug, slug } = data;
    if (slug !== ogSlug) {
      const count = await prisma.event.count({ where: { slug } });
      if (count >= 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL slug is already taken",
          path: ["slug"],
        });
      }
    }
  });

const dateFields = z
  .object({
    dateEnd: z.string().date(),
    dateStart: z.string().date(),
  })
  .superRefine((data, ctx) => {
    const { dateEnd, dateStart } = data;
    if (dateEnd === "" && dateStart === "") return;
    const dateToday = getTodayDate();
    if (dateStart < dateToday) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "Start date cannot be earlier than today",
        path: ["dateStart"],
      });
    }
    if (dateEnd < dateToday) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End date cannot be earlier than today",
        path: ["dateEnd"],
      });
    }
    if (dateEnd < dateStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End date cannot be earlier than start date",
        path: ["dateEnd"],
      });
    }
  });

export const eventFormSchema = fields.and(dateFields);
