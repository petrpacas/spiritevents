import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { requireUserSession } from "~/services/session.server";
import { EventSchema } from "~/services/validations";
import prisma from "~/services/db.server";
import { CountrySelect } from "~/components/";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Edit ~ ${data?.title} ~ Seek Gathering` }];
};

export async function action({ params, request }: ActionFunctionArgs) {
  await requireUserSession(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = EventSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    return errors;
  }
  await prisma.event.update({
    where: { id: params.eventId },
    data: result.data,
  });
  return redirect(`/events/${params.eventId}`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserSession(request);
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  return event;
}

export default function EditEvent() {
  const errors = useActionData<typeof action>();
  const event = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <h1 className="mb-8 text-4xl">Edit ~ {event.title}</h1>
      <Form method="post">
        <div className="mb-8 grid gap-4">
          <label className="grid gap-2">
            title
            <input type="text" name="title" defaultValue={event.title} />
            {errors?.fieldErrors.title && (
              <p className="text-red-500">
                {errors.fieldErrors.title.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2">
            dateStart
            <input
              type="date"
              name="dateStart"
              defaultValue={event.dateStart}
            />
            {errors?.fieldErrors.dateStart && (
              <p className="text-red-500">
                {errors.fieldErrors.dateStart.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2">
            dateEnd
            <input type="date" name="dateEnd" defaultValue={event.dateEnd} />
            {errors?.fieldErrors.dateEnd && (
              <p className="text-red-500">
                {errors.fieldErrors.dateEnd.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2">
            country
            <CountrySelect defaultValue={event.country} />
            {errors?.fieldErrors.country && (
              <p className="text-red-500">
                {errors.fieldErrors.country.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2">
            coords
            <input
              type="text"
              name="coords"
              defaultValue={event.coords ?? ""}
            />
            {errors?.fieldErrors.coords && (
              <p className="text-red-500">
                {errors.fieldErrors.coords.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2">
            link
            <input type="text" name="link" defaultValue={event.link ?? ""} />
            {errors?.fieldErrors.link && (
              <p className="text-red-500">
                {errors.fieldErrors.link.join(", ")}
              </p>
            )}
          </label>
          <label className="grid gap-2">
            description
            <textarea
              name="description"
              defaultValue={event.description ?? ""}
            />
            {errors?.fieldErrors.description && (
              <p className="text-red-500">
                {errors.fieldErrors.description.join(", ")}
              </p>
            )}
          </label>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded bg-amber-600 px-4 py-2 text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            className="rounded border border-amber-600 bg-white px-4 py-2 text-amber-600"
          >
            Cancel
          </button>
        </div>
      </Form>
    </>
  );
}
