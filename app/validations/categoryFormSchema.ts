import slugify from "slugify";
import { z } from "zod";
import { prisma } from "~/services";

export const categoryFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s+/g, " "))
      .superRefine((value, ctx) => {
        if (value.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Name must contain at least 2 characters",
          });
        }
      }),
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
    originName: z
      .string()
      .transform((value) => value.toLowerCase())
      .optional(),
    originSlug: z.string().optional(),
  })
  .superRefine(async (data, ctx) => {
    const { name, slug, originName, originSlug } = data;
    if (name.toLowerCase() !== originName && name.length > 2) {
      const count = await prisma.category.count({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (count >= 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is already taken",
          path: ["name"],
        });
      }
    }
    if (slug !== originSlug && slug.length > 2) {
      const count = await prisma.category.count({
        where: { slug: { equals: slug, mode: "insensitive" } },
      });
      if (count >= 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL slug is already taken",
          path: ["slug"],
        });
      }
    }
  });
