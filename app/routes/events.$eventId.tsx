import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import prisma from "~/db";

export const meta: MetaFunction = ({ data }) => {
  return [{ title: `${data.title} ~ Seek Gathering` }];
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

export async function action({ params }: ActionFunctionArgs) {
  await prisma.event.delete({ where: { id: params.eventId } });
  return redirect("/events");
}

export default function ShowEvent() {
  const event = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-4xl mb-8">{event.title}</h1>
      <ul className="mb-8">
        <li>dateStart: {event.dateStart}</li>
        <li>dateEnd: {event.dateEnd}</li>
        <li>country: {event.country}</li>
        <li>coords: {event.coords}</li>
        <li>link: {event.link}</li>
        <li>description: {event.description}</li>
      </ul>
      <ul className="mb-8 text-slate-400">
        <li>id: {event.id}</li>
        <li>createdAt: {event.createdAt}</li>
        <li>updatedAt: {event.updatedAt}</li>
      </ul>
      <div className="flex flex-col items-center justify-center gap-4">
        <Form action="edit">
          <button type="submit">Edit</button>
        </Form>
        <Form
          replace
          method="post"
          onSubmit={(event) => {
            const response = confirm(
              "Please confirm you want to delete this record."
            );
            if (!response) {
              event.preventDefault();
            }
          }}
        >
          <button type="submit">Delete</button>
        </Form>
        <Link to="/events">Back</Link>
      </div>
    </>
  );
}
