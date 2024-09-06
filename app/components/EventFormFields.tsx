import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { Category, Prisma } from "@prisma/client";
import type { RefObject } from "react";
import { SerializeFrom } from "@remix-run/node";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import slugify from "slugify";
import { z } from "zod";
import { countries, EventStatus } from "~/utils";
import { eventFormSchema } from "~/validations";
import { DescriptionEditor } from "./DescriptionEditor";
import { Select } from "./Select";

type EventWithCategories = Prisma.EventGetPayload<{
  include: { categories: true };
}>;
type Props = {
  errors?: z.inferFlattenedErrors<typeof eventFormSchema>;
  event?: SerializeFrom<EventWithCategories>;
  categories?: SerializeFrom<Category[]>;
  isSuggesting?: boolean;
  mdxEditorRef: RefObject<MDXEditorMethods>;
};

export const EventFormFields = ({
  categories,
  errors,
  event,
  isSuggesting,
  mdxEditorRef,
}: Props) => {
  const [slugModified, setSlugModified] = useState(false);
  const [dateStartState, setDateStart] = useState(event?.dateStart ?? "");
  const [dateEndState, setDateEnd] = useState(event?.dateEnd ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const isSlugFreelyModifiable =
    !isSuggesting &&
    event?.status !== EventStatus.DRAFT &&
    event?.status !== EventStatus.PUBLISHED;
  const handleSlugFocus = () => {
    if (event?.status !== EventStatus.SUGGESTED || slugModified) {
      return;
    }
    setSlugModified(true);
    setSlug(
      slugify(title, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugModified(true);
    setSlug(
      slugify(e.currentTarget.value, {
        lower: true,
        strict: true,
        trim: false,
      }),
    );
  };
  const handleSlugBlur = () => {
    setSlug((prevSlug) =>
      slugify(prevSlug, {
        lower: true,
        strict: true,
      }),
    );
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
    if (isSlugFreelyModifiable) {
      handleSlugChange(e);
    }
  };
  const handleTitleBlur = () => {
    setTitle((prevTitle) => prevTitle.trim().replace(/\s+/g, " "));
    handleSlugBlur();
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      <label className={`grid gap-2 ${isSuggesting ? "md:col-span-2" : ""}`}>
        <div>
          Title <span className="text-amber-600">(required)</span>
        </div>
        <input
          required
          autoComplete="off"
          type="text"
          name="title"
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          value={title}
          className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.title && (
          <p className="text-red-600">{errors.fieldErrors.title.join(", ")}</p>
        )}
      </label>
      {!isSuggesting && (
        <label className="grid gap-2">
          <div>
            URL slug{" "}
            <span className="text-amber-600">
              (required) ~{" "}
              {isSlugFreelyModifiable
                ? "should be permament"
                : "change with caution"}
            </span>
          </div>
          <input
            required
            autoComplete="off"
            type="text"
            name="slug"
            onFocus={handleSlugFocus}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            value={slug}
            placeholder="e.g. example-event"
            className={`rounded border-stone-300 placeholder-stone-400 ${isSlugFreelyModifiable ? (event?.status === EventStatus.SUGGESTED && !slugModified ? "text-stone-400" : undefined) : "text-amber-600"} shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800`}
          />
          {errors?.fieldErrors.slug && (
            <p className="text-red-600">{errors.fieldErrors.slug.join(", ")}</p>
          )}
        </label>
      )}
      <label className="grid gap-2 md:col-span-1">
        <div>
          Country <span className="text-amber-600">(required)</span>
        </div>
        <Select
          required
          options={countries}
          emptyOption={event?.country ? undefined : "— select a country —"}
          defaultValue={event?.country || ""}
          name="country"
          className="custom-caret-color w-full cursor-pointer rounded border-stone-300 shadow-sm transition-shadow invalid:text-stone-400 hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.country && (
          <p className="text-red-600">
            {errors.fieldErrors.country.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        Location hint{" "}
        <input
          autoComplete="off"
          type="text"
          name="location"
          defaultValue={event?.location}
          placeholder="eg. city, venue, or area"
          className="rounded border-stone-300 placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.location && (
          <p className="text-red-600">
            {errors.fieldErrors.location.join(", ")}
          </p>
        )}
      </label>
      {categories && categories.length > 0 && (
        <div className="grid gap-2 md:col-span-2">
          Categories
          <div className="flex flex-wrap gap-4 rounded-lg border border-stone-300 p-4">
            {categories.map((category) => (
              <label
                className="flex cursor-pointer items-center gap-2 rounded border border-stone-300 px-4 py-2 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
                key={category.id}
              >
                <input
                  autoComplete="off"
                  type="checkbox"
                  name="category"
                  value={category.id}
                  defaultChecked={Boolean(
                    event?.categories.find(
                      (eventCategory) => eventCategory.id === category.id,
                    ),
                  )}
                  className="rounded border border-stone-300 checked:bg-amber-600 hover:checked:bg-amber-600 focus:checked:bg-amber-600 dark:bg-stone-800"
                />
                {category.name}
              </label>
            ))}
          </div>
          {errors?.fieldErrors.categories && (
            <p className="text-red-600">
              {errors.fieldErrors.categories.join(", ")}
            </p>
          )}
        </div>
      )}
      <label className="grid gap-2 md:col-span-1">
        Start date
        <input
          autoComplete="off"
          type="date"
          name="dateStart"
          placeholder="yyyy-mm-dd"
          className="rounded border-stone-300 placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
          value={dateStartState}
          onChange={(e) => setDateStart(e.target.value)}
          onBlur={(e) => {
            if (dateStartState > dateEndState || dateEndState === "") {
              setDateEnd(e.target.value);
            }
          }}
        />
        {errors?.fieldErrors.dateStart && (
          <p className="text-red-600">
            {errors.fieldErrors.dateStart.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2 md:col-span-1">
        End date
        <input
          autoComplete="off"
          type="date"
          name="dateEnd"
          placeholder="yyyy-mm-dd"
          className="rounded border-stone-300 placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
          value={dateEndState}
          onChange={(e) => setDateEnd(e.target.value)}
          onBlur={(e) => {
            if (dateEndState < dateStartState || dateStartState === "") {
              setDateStart(e.target.value);
            }
          }}
        />
        {errors?.fieldErrors.dateEnd && (
          <p className="text-red-600">
            {errors.fieldErrors.dateEnd.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        Start time
        <input
          autoComplete="off"
          type="time"
          name="timeStart"
          placeholder="hh:mm"
          defaultValue={event?.timeStart}
          className="rounded border-stone-300 placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.timeStart && (
          <p className="text-red-600">
            {errors.fieldErrors.timeStart.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        End time
        <input
          autoComplete="off"
          type="time"
          name="timeEnd"
          placeholder="hh:mm"
          defaultValue={event?.timeEnd}
          className="rounded border-stone-300 placeholder-stone-400 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.timeEnd && (
          <p className="text-red-600">
            {errors.fieldErrors.timeEnd.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        Website link
        <input
          autoComplete="off"
          type="text"
          name="linkWebsite"
          defaultValue={event?.linkWebsite}
          className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.linkWebsite && (
          <p className="text-red-600">
            {errors.fieldErrors.linkWebsite.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        Tickets link
        <input
          autoComplete="off"
          type="text"
          name="linkTickets"
          defaultValue={event?.linkTickets}
          className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.linkTickets && (
          <p className="text-red-600">
            {errors.fieldErrors.linkTickets.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        FB event link
        <input
          autoComplete="off"
          type="text"
          name="linkFbEvent"
          defaultValue={event?.linkFbEvent}
          className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.linkFbEvent && (
          <p className="text-red-600">
            {errors.fieldErrors.linkFbEvent.join(", ")}
          </p>
        )}
      </label>
      <label className="grid gap-2">
        Location link
        <input
          autoComplete="off"
          type="text"
          name="linkLocation"
          defaultValue={event?.linkLocation}
          className="rounded border-stone-300 shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
        />
        {errors?.fieldErrors.linkLocation && (
          <p className="text-red-600">
            {errors.fieldErrors.linkLocation.join(", ")}
          </p>
        )}
      </label>
      <ClientOnly
        fallback={
          <label className="grid gap-2 md:col-span-2">
            <div>
              Description{" "}
              <span className="text-amber-600">~ loading editor&hellip;</span>
            </div>
            <textarea
              name="description"
              readOnly
              defaultValue={event?.description}
              className="min-h-20 rounded border-stone-300 shadow-sm transition-shadow read-only:bg-stone-300 hover:shadow-md active:shadow dark:bg-stone-800"
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
          <div className="grid gap-2 md:col-span-2">
            Description
            <DescriptionEditor
              ref={mdxEditorRef}
              className="overflow-x-auto rounded border border-stone-300 bg-white shadow-sm transition-shadow hover:shadow-md active:shadow dark:bg-stone-800"
              markdown={event?.description}
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
