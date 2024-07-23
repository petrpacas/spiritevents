import { z } from "zod";

export const eventSchema = z
  .object({
    coords: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s/g, ""))
      .or(z.literal("")),
    country: z.string().trim().length(2),
    dateEnd: z.string().date(),
    dateStart: z.string().date(),
    description: z.string().trim().or(z.literal("")),
    link: z.string().url().or(z.literal("")),
    title: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s+/g, " "))
      .pipe(z.string().min(5)),
  })
  .refine((data) => data.dateEnd >= data.dateStart, {
    message: "End date cannot be earlier than start date",
    path: ["dateEnd"],
  });
