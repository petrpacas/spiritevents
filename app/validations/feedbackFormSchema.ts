import { z } from "zod";

export const feedbackFormSchema = z.object({
  contact: z.string().trim().or(z.literal("")),
  content: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, " "))
    .superRefine((value, ctx) => {
      if (value.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Your feedback must contain at least 2 characters",
        });
      }
    }),
  name: z.string().trim().or(z.literal("")),
});
