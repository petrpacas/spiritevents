import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { CountrySelect } from "~/components/";
import { prisma, requireUserSession } from "~/services";
import { eventSchema } from "~/validations";

export const meta: MetaFunction = () => {
  return [{ title: "New Event ~ Seek Gathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = eventSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    return errors;
  }
  await prisma.event.create({ data: result.data });
  return redirect("/events");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return null;
}

export default function NewEvent() {
  const errors = useActionData<typeof action>();
  return (
    <Form method="post">
      <h1 className="mb-8 text-3xl sm:text-4xl">New Event</h1>
      <div className="mb-8 grid gap-4">
        <label className="grid gap-2">
          Title
          <input
            type="text"
            name="title"
            className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors?.title && (
            <p className="text-red-600">
              {errors.fieldErrors.title.join(", ")}
            </p>
          )}
        </label>
        <div className="grid gap-4 md:flex md:items-start">
          <label className="grid gap-2 md:flex-1">
            Start Date
            <input
              type="date"
              name="dateStart"
              className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors?.dateStart && (
              <p className="text-red-600">
                {errors.fieldErrors.dateStart.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2 md:flex-1">
            End Date
            <input
              type="date"
              name="dateEnd"
              className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors?.dateEnd && (
              <p className="text-red-600">
                {errors.fieldErrors.dateEnd.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2 md:flex-1">
            Country
            <CountrySelect className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow" />
            {errors?.fieldErrors?.country && (
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
              className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors?.coords && (
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
              className="rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
            />
            {errors?.fieldErrors?.link && (
              <p className="text-red-600">
                {errors.fieldErrors.link.join(", ")}
              </p>
            )}
          </label>
        </div>
        <label className="grid gap-2">
          <div>
            Description <span className="text-amber-600">(optional)</span>
          </div>
          <textarea
            name="description"
            className="min-h-20 rounded bg-white px-4 py-2 hover:shadow-md active:shadow"
          />
          {errors?.fieldErrors?.description && (
            <p className="text-red-600">
              {errors.fieldErrors.description.join(", ")}
            </p>
          )}
        </label>
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="rounded border border-transparent bg-amber-800 px-4 py-2 text-white hover:shadow-md active:shadow"
        >
          Save
        </button>
        <Link
          to="/events"
          className="rounded border border-amber-800 px-4 py-2 text-amber-800 hover:shadow-md active:shadow"
        >
          Back
        </Link>
      </div>
    </Form>
  );
}
