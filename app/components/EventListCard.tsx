import { EventStatus } from "@prisma/client";
import { Link } from "@remix-run/react";

type Props = {
  country: string;
  dateEnd: string;
  dateStart: string;
  slug: string;
  status?: EventStatus;
  title: string;
};

export const EventListCard = ({
  country,
  dateEnd,
  dateStart,
  slug,
  status,
  title,
}: Props) => {
  let statusLetter = undefined;
  let statusBg = "bg-white";
  switch (status) {
    case EventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-gray-50";
      break;
    case EventStatus.PUBLISHED:
      break;
    case EventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-emerald-50";
      break;
    default:
      break;
  }
  return (
    <Link
      to={`/events/${slug}`}
      className={`${statusBg} grid gap-2 border-y border-amber-600 p-4 shadow-sm transition-shadow hover:shadow-md active:shadow max-sm:-mx-4 max-sm:py-2 sm:rounded-lg sm:border-x md:flex md:items-center md:justify-between md:gap-4`}
    >
      <h3 className="text-xl sm:text-2xl">
        {statusLetter && (
          <>
            <span className="text-amber-600">{statusLetter}</span>{" "}
          </>
        )}
        {title} <span className="text-amber-600">({country})</span>
      </h3>
      <div className="flex gap-2 text-sm sm:text-base md:items-center md:justify-end md:text-center">
        <span>{new Date(dateStart).toDateString()}</span>
        {dateEnd !== dateStart && (
          <>
            <span className="text-amber-600">&gt;&gt;</span>
            <span>{new Date(dateEnd).toDateString()}</span>
          </>
        )}
      </div>
    </Link>
  );
};
