import { Link } from "@remix-run/react";

type Props = {
  country: string;
  dateEnd: string;
  dateStart: string;
  id: string;
  isHomepage?: boolean;
  title: string;
};

export const EventListCard = ({
  country,
  dateEnd,
  dateStart,
  id,
  isHomepage,
  title,
}: Props) => {
  return (
    <Link
      to={`/events/${id}`}
      className={`${isHomepage ? "" : ""}grid gap-2 border-y border-amber-600 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:shadow max-sm:-mx-4 max-sm:py-2 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:rounded-lg sm:border-x`}
    >
      <h3 className="text-xl sm:text-2xl">
        {title} <span className="text-amber-600">({country})</span>
      </h3>
      <div className="flex gap-2 text-sm sm:items-center sm:justify-center sm:text-center sm:text-base">
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
