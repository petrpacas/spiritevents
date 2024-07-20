import { z } from "zod";

export const EventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s+/g, " "))
      .pipe(z.string().min(5)),
    dateStart: z.string().date(),
    dateEnd: z.string().date(),
    country: z.string().trim().length(2),
    coords: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s/g, ""))
      .or(z.literal("")),
    link: z.string().url().or(z.literal("")),
    description: z.string().trim().or(z.literal("")),
  })
  .refine((data) => data.dateEnd >= data.dateStart, {
    message: "End date cannot be earlier than start date",
    path: ["dateEnd"],
  });
