import { z } from "zod";

export const subscriberFormSchema = z.object({
  name: z.string().trim().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});
