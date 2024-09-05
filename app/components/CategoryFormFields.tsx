import type { Category } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { useState } from "react";
import slugify from "slugify";
import { z } from "zod";
import { categoryFormSchema } from "~/validations";

type Props = {
  errors?: z.inferFlattenedErrors<typeof categoryFormSchema>;
  category?: SerializeFrom<Category>;
};

export const CategoryFormFields = ({ errors, category }: Props) => {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(
      slugify(e.currentTarget.value, {
        lower: true,
        strict: true,
        trim: false,
      }),
    );
  };
  const handleSlugBlur = () => {
    setSlug((value) =>
      slugify(value, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
    handleSlugChange(e);
  };
  const handleNameBlur = () => {
    setName((value) => value.trim().replace(/\s+/g, " "));
    handleSlugBlur();
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      <label className={`grid gap-2`}>
        <div>
          Name <span className="text-amber-600">(required)</span>
        </div>
        <input
          required
          autoComplete="off"
          type="text"
          name="name"
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          value={name}
          className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.name && (
          <p className="text-red-600">{errors.fieldErrors.name.join(", ")}</p>
        )}
      </label>
      <label className="grid gap-2">
        <div>
          URL slug <span className="text-amber-600">(required)</span>
        </div>
        <input
          required
          autoComplete="off"
          type="text"
          name="slug"
          onChange={handleSlugChange}
          onBlur={handleSlugBlur}
          value={slug}
          placeholder="e.g. example-category"
          className="rounded border-stone-300 text-amber-600 placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.slug && (
          <p className="text-red-600">{errors.fieldErrors.slug.join(", ")}</p>
        )}
      </label>
    </div>
  );
};
