import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, redirect, Link, useActionData } from "@remix-run/react";
import { requireUserSession } from "~/services/session.server";
import { EventSchema } from "~/services/validations";
import prisma from "~/services/db.server";
import { CountrySelect } from "~/components/";

export const meta: MetaFunction = () => {
  return [{ title: "New Event ~ Seek Gathering" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = EventSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    return errors;
  }
  await prisma.event.create({ data: result.data });
  return redirect("/events");
}

export default function NewEvent() {
  const errors = useActionData<typeof action>();
  return (
    <>
      <h1 className="text-4xl mb-8">New Event</h1>
      <Form method="post">
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex flex-col gap-2">
            title
            <input type="text" name="title" className="bg-orange-50" />
            {errors?.fieldErrors.title && (
              <p className="text-red-500">
                {errors.fieldErrors.title.join(", ")}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2">
            dateStart
            <input type="date" name="dateStart" className="bg-orange-50" />
            {errors?.fieldErrors.dateStart && (
              <p className="text-red-500">
                {errors.fieldErrors.dateStart.join(", ")}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2">
            dateEnd
            <input type="date" name="dateEnd" className="bg-orange-50" />
            {errors?.fieldErrors.dateEnd && (
              <p className="text-red-500">
                {errors.fieldErrors.dateEnd.join(", ")}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2">
            country
            <CountrySelect />
            {errors?.fieldErrors.country && (
              <p className="text-red-500">
                {errors.fieldErrors.country.join(", ")}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2">
            coords
            <input type="text" name="coords" className="bg-orange-50" />
            {errors?.fieldErrors.coords && (
              <p className="text-red-500">
                {errors.fieldErrors.coords.join(", ")}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2">
            link
            <input type="text" name="link" className="bg-orange-50" />
            {errors?.fieldErrors.link && (
              <p className="text-red-500">
                {errors.fieldErrors.link.join(", ")}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2">
            description
            <textarea name="description" className="bg-orange-50" />
            {errors?.fieldErrors.description && (
              <p className="text-red-500">
                {errors.fieldErrors.description.join(", ")}
              </p>
            )}
          </label>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <button type="submit">Save</button>
          <Link to="/events">Back</Link>
        </div>
      </Form>
    </>
  );
}
