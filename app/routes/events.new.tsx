import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, Link } from "@remix-run/react";
import prisma from "~/db";

export const meta: MetaFunction = () => {
  return [{ title: "New Event ~ Seek Gathering" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  await prisma.event.create({ data });
  return redirect("/events");
}

export default function NewEvent() {
  return (
    <>
      <h1 className="text-4xl mb-8">New Event</h1>
      <Form method="post">
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex flex-col gap-2">
            title
            <input type="text" name="title" className="bg-orange-50" />
          </label>
          <label className="flex flex-col gap-2">
            dateStart
            <input type="date" name="dateStart" className="bg-orange-50" />
          </label>
          <label className="flex flex-col gap-2">
            dateEnd
            <input type="date" name="dateEnd" className="bg-orange-50" />
          </label>
          <label className="flex flex-col gap-2">
            country
            <input type="text" name="country" className="bg-orange-50" />
          </label>
          <label className="flex flex-col gap-2">
            coords
            <input type="text" name="coords" className="bg-orange-50" />
          </label>
          <label className="flex flex-col gap-2">
            link
            <input type="text" name="link" className="bg-orange-50" />
          </label>
          <label className="flex flex-col gap-2">
            description
            <textarea name="description" className="bg-orange-50" />
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
