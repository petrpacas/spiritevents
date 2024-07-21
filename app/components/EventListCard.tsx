import React from "react";
import { Link } from "@remix-run/react";

interface EventListCard {
  id: string;
  title: string;
  country: string;
  dateStart: string;
  dateEnd: string;
}

export const EventListCard: React.FC<EventListCard> = ({
  id,
  title,
  country,
  dateStart,
  dateEnd,
}) => {
  return (
    <Link
      to={`/events/${id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-amber-600 bg-white p-4 hover:shadow-md active:shadow"
    >
      <h3 className="text-2xl">
        {title} <span className="text-neutral-400">({country})</span>
      </h3>
      <h4 className="flex gap-2 text-lg">
        <span>{new Date(dateStart).toDateString()}</span>
        {dateEnd !== dateStart && (
          <>
            <span className="text-neutral-400">&gt;&gt;</span>
            <span>{new Date(dateEnd).toDateString()}</span>
          </>
        )}
      </h4>
    </Link>
  );
};
