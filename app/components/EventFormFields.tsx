import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { Event } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import type { RefObject } from "react";
import type { typeToFlattenedError } from "zod";
import { ClientOnly } from "remix-utils/client-only";
import { CountrySelect, DescriptionEditor } from "~/components/";

type Props = {
  errors: SerializeFrom<typeToFlattenedError<Event, string>> | undefined;
  event?: SerializeFrom<Event>;
  mdxEditorRef: RefObject<MDXEditorMethods>;
};

export const EventFormFields = ({ errors, event, mdxEditorRef }: Props) => {
  return (
    <div className="mb-8 grid gap-4">
      <label className="grid gap-2">
        Title
        <input
          type="text"
          name="title"
          defaultValue={event?.title}
          className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
        />
        {errors?.fieldErrors.title && (
          <p className="text-red-600">{errors.fieldErrors.title.join(", ")}</p>
        )}
      </label>
      <div className="grid gap-4 md:flex md:items-start">
        <label className="grid gap-2 md:flex-1">
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
        <label className="grid gap-2 md:flex-1">
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
        <label className="grid gap-2 md:flex-1">
          Country
          <CountrySelect
            defaultValue={event?.country}
            className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors.country && (
            <p className="text-red-600">
              {errors.fieldErrors.country.join(", ")}
            </p>
          )}
        </label>
      </div>
      <div className="grid gap-4 md:flex md:items-start">
        <label className="grid gap-2 md:flex-1">
          <div>
            Coordinates <span className="text-amber-600">(optional)</span>
          </div>
          <input
            type="text"
            name="coords"
            defaultValue={event?.coords ?? ""}
            className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors.coords && (
            <p className="text-red-600">
              {errors.fieldErrors.coords.join(", ")}
            </p>
          )}
        </label>
        <label className="grid gap-2 md:flex-1">
          <div>
            Link <span className="text-amber-600">(optional)</span>
          </div>
          <input
            type="text"
            name="link"
            defaultValue={event?.link ?? ""}
            className="rounded border-gray-200 shadow-sm transition-shadow hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors.link && (
            <p className="text-red-600">{errors.fieldErrors.link.join(", ")}</p>
          )}
        </label>
      </div>
      <ClientOnly
        fallback={
          <label className="grid gap-2">
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
          <div className="grid gap-2">
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
