import slugify from "slugify";
import { z } from "zod";
import { countries, EventStatus } from "~/utils";

export const eventFormSchema = z
  .object({
    categories: z.string().transform((value) => JSON.parse(value)),
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
    dateEnd: z.string().date().or(z.literal("")),
    dateStart: z.string().date().or(z.literal("")),
    description: z.string().trim().or(z.literal("")),
    linkFbEvent: z.string().url().or(z.literal("")),
    linkLocation: z.string().url().or(z.literal("")),
    linkTickets: z.string().url().or(z.literal("")),
    linkWebsite: z.string().url().or(z.literal("")),
    location: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s+/g, " "))
      .or(z.literal("")),
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
          return ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL slug must contain at least 2 characters",
          });
        }
      }),
    timeEnd: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time")
      .or(z.literal("")),
    timeStart: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time")
      .or(z.literal("")),
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
    originStatus: z.nativeEnum(EventStatus).optional(),
  })
  .superRefine((data, ctx) => {
    const { dateEnd, dateStart, originStatus, timeEnd, timeStart } = data;
    if (dateEnd < dateStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End date can't be earlier than start date",
        path: ["dateStart"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End date can't be earlier than start date",
        path: ["dateEnd"],
      });
    }
    if (
      dateEnd === "" &&
      dateStart === "" &&
      originStatus === EventStatus.PUBLISHED
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
    }
    if (dateEnd === dateStart && timeEnd !== "" && timeEnd < timeStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End time can't be earlier than start time for one-day events",
        path: ["timeStart"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "End time can't be earlier than start time for one-day events",
        path: ["timeEnd"],
      });
    }
  });
