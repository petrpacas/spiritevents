import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { Event } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import type { RefObject } from "react";
import type { typeToFlattenedError } from "zod";
import { ClientOnly } from "remix-utils/client-only";
import { useState } from "react";
import slugify from "slugify";
import { CountrySelect } from "./CountrySelect";
import { DescriptionEditor } from "./DescriptionEditor";

type Props = {
  errors: SerializeFrom<typeToFlattenedError<Event, string>> | undefined;
  event?: SerializeFrom<Event>;
  isSuggestion?: boolean;
  mdxEditorRef: RefObject<MDXEditorMethods>;
};

export const EventFormFields = ({
  errors,
  event,
  isSuggestion,
  mdxEditorRef,
}: Props) => {
  const [slug, setSlug] = useState(event?.slug ?? "");
  const handleSlugBlur = () => {
    setSlug((prevSlug) =>
      slugify(prevSlug, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const slugValue = slugify(value, {
      lower: true,
      strict: true,
      trim: false,
    });
    setSlug(slugValue);
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSlugChange(e);
  };
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-6 md:items-start">
      <label className="grid gap-2 md:col-span-3">
        Title
        <input
          type="text"
          name="title"
          onChange={
            event?.title || isSuggestion ? undefined : handleTitleChange
          }
          defaultValue={event?.title}
          className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.title && (
          <p className="text-red-600">{errors.fieldErrors.title.join(", ")}</p>
        )}
      </label>
      {!isSuggestion && (
        <label className="grid gap-2 md:col-span-3">
          <div>
            URL slug{" "}
            <span className="text-amber-600">
              ~ {event?.slug ? "Change with caution" : "Should be permament"}
            </span>
          </div>
          <input
            type="text"
            name="slug"
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            value={slug}
            placeholder="e.g. example-event-2024 (use the year)"
            className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors.slug && (
            <p className="text-red-600">{errors.fieldErrors.slug.join(", ")}</p>
          )}
        </label>
      )}
      <label
        className={`${isSuggestion ? "md:col-span-3" : "md:col-span-2"} grid gap-2`}
      >
        Country
        <CountrySelect
          defaultValue={event?.country}
          className="w-full rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.country && (
          <p className="text-red-600">
            {errors.fieldErrors.country.join(", ")}
          </p>
        )}
      </label>
      <label
        className={`${isSuggestion ? "md:col-span-3" : "md:col-span-2"} grid gap-2`}
      >
        Start date
        <input
          type="date"
          name="dateStart"
          defaultValue={event?.dateStart}
          className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.dateStart && (
          <p className="text-red-600">
            {errors.fieldErrors.dateStart.join(", ")}
          </p>
        )}
      </label>
      <label
        className={`${isSuggestion ? "md:col-span-3" : "md:col-span-2"} grid gap-2`}
      >
        End date
        <input
          type="date"
          name="dateEnd"
          defaultValue={event?.dateEnd}
          className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.dateEnd && (
          <p className="text-red-600">
            {errors.fieldErrors.dateEnd.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2 md:col-span-3">
        <div>
          Website link <span className="text-amber-600">(optional)</span>
        </div>
        <input
          type="text"
          name="linkWebsite"
          defaultValue={event?.linkWebsite ?? ""}
          className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.linkWebsite && (
          <p className="text-red-600">
            {errors.fieldErrors.linkWebsite.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2 md:col-span-3">
        <div>
          Location link <span className="text-amber-600">(optional)</span>
        </div>
        <input
          type="text"
          name="linkLocation"
          defaultValue={event?.linkLocation ?? ""}
          className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.linkLocation && (
          <p className="text-red-600">
            {errors.fieldErrors.linkLocation.join(", ")}
          </p>
        )}
      </label>
      <ClientOnly
        fallback={
          <label className="grid gap-2 md:col-span-6">
            <div>
              Description{" "}
              <span className="text-amber-600">
                (optional) ~ Loading markdown editor&hellip;
              </span>
            </div>
            <textarea
              name="description"
              readOnly
              defaultValue={event?.description ?? ""}
              className="min-h-20 rounded border-gray-200 shadow-sm transition-shadow read-only:bg-gray-50 hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors.description && (
              <p className="text-red-600">
                {errors.fieldErrors.description.join(", ")}
              </p>
            )}
          </label>
        }
      >
        {() => (
          <div className="grid gap-2 md:col-span-6">
            <div>
              Description <span className="text-amber-600">(optional)</span>
            </div>
            <DescriptionEditor
              ref={mdxEditorRef}
              className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md active:shadow"
              markdown={event?.description ?? ""}
            />
            {errors?.fieldErrors.description && (
              <p className="text-red-600">
                {errors.fieldErrors.description.join(", ")}
              </p>
            )}
          </div>
        )}
      </ClientOnly>
    </div>
  );
};
