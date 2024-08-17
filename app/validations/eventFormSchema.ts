import slugify from "slugify";
import { z } from "zod";
import { prisma } from "~/services";
import { countries, EventStatus, getTodayDate } from "~/utils";

const restrictedSlugs = ["new", "suggest"];

const dateUnrelatedFields = z
  .object({
    country: z.string().superRefine((value, ctx) => {
      if (value === "" || value.length !== 2) {
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Country must be selected",
        });
      }
      const countryCodeFound = countries.some(
        (country) => country.code === value,
      );
      if (!countryCodeFound) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Proper country must be selected",
        });
      }
    }),
    description: z.string().trim().or(z.literal("")),
    linkLocation: z.string().trim().or(z.literal("")),
    linkWebsite: z.string().trim().or(z.literal("")),
    origSlug: z.string().optional(),
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
            message: "URL slug must contain at least 2 characters",
            fatal: true,
          });
          return z.NEVER;
        }

        if (restrictedSlugs.includes(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL slug cannot be a restricted word",
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
    const { origSlug, slug } = data;
    if (slug !== origSlug) {
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

const dateRelatedFields = z
  .object({
    dateEnd: z.string().date().or(z.literal("")),
    dateStart: z.string().date().or(z.literal("")),
    origDateEnd: z.string().optional(),
    origDateStart: z.string().optional(),
    origStatus: z.nativeEnum(EventStatus).optional(),
  })
  .superRefine((data, ctx) => {
    const { dateEnd, dateStart, origDateEnd, origDateStart, origStatus } = data;
    if (dateEnd === origDateEnd && dateStart === origDateStart) {
      return;
    }
    if (
      dateEnd === "" &&
      dateStart === "" &&
      origStatus !== EventStatus.PUBLISHED
    ) {
      return;
    }
    if (
      dateEnd === "" &&
      dateStart === "" &&
      origStatus == EventStatus.PUBLISHED
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "Published events must have a date",
        path: ["dateStart"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "Published events must have a date",
        path: ["dateEnd"],
      });
      return;
    }
    const dateToday = getTodayDate();
    if (dateStart < dateToday) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "Start date cannot be earlier than today",
        path: ["dateStart"],
      });
    }
    if (dateEnd < dateStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End date cannot be earlier than start date",
        path: ["dateEnd"],
      });
    } else if (dateEnd < dateToday) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End date cannot be earlier than today",
        path: ["dateEnd"],
      });
    }
  });

export const eventFormSchema = dateUnrelatedFields.and(dateRelatedFields);
