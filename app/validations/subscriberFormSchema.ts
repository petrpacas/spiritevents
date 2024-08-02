import { z } from "zod";
import { prisma } from "~/services";

export const subscriberFormSchema = z
  .object({
    email: z.string().trim().email(),
  })
  .superRefine(async (data, ctx) => {
    const { email } = data;
    const count = await prisma.subscriber.count({ where: { email } });
    if (count >= 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is already subscribed",
        path: ["email"],
      });
    }
  });
