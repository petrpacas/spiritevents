import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, redirect, useLoaderData, useNavigate } from "@remix-run/react";
import prisma from "~/db";

export const meta: MetaFunction = ({ data }) => {
  return [{ title: `Edit ~ ${data.title} ~ Seek Gathering` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
  });
  if (!event) {
    throw new Response("Not Found", { status: 404 });
  }
  return event;
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  await prisma.event.update({ where: { id: params.eventId }, data });
  return redirect(`/events/${params.eventId}`);
}

export default function EditEvent() {
  const event = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <>
      <h1 className="text-4xl mb-8">Edit ~ {event.title}</h1>
      <Form method="post">
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex flex-col gap-2">
            title
            <input
              type="text"
              name="title"
              className="bg-orange-50"
              defaultValue={event.title}
            />
          </label>
          <label className="flex flex-col gap-2">
            dateStart
            <input
              type="date"
              name="dateStart"
              className="bg-orange-50"
              defaultValue={event.dateStart}
            />
          </label>
          <label className="flex flex-col gap-2">
            dateEnd
            <input
              type="date"
              name="dateEnd"
              className="bg-orange-50"
              defaultValue={event.dateEnd}
            />
          </label>
          <label className="flex flex-col gap-2">
            country
            <input
              type="text"
              name="country"
              className="bg-orange-50"
              defaultValue={event.country}
            />
          </label>
          <label className="flex flex-col gap-2">
            coords
            <input
              type="text"
              name="coords"
              className="bg-orange-50"
              defaultValue={event.coords}
            />
          </label>
          <label className="flex flex-col gap-2">
            link
            <input
              type="text"
              name="link"
              className="bg-orange-50"
              defaultValue={event.link}
            />
          </label>
          <label className="flex flex-col gap-2">
            description
            <textarea
              name="description"
              className="bg-orange-50"
              defaultValue={event.description}
            />
          </label>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <button type="submit">Save</button>
          <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
          >
            Cancel
          </button>
        </div>
      </Form>
    </>
  );
}
