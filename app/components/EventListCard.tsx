import { Link } from "@remix-run/react";
import { EventStatus, getStatusColors } from "~/utils";

type Props = {
  country: string;
  dateEnd: string;
  dateStart: string;
  slug: string;
  status?: keyof typeof EventStatus;
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
  const [statusLetter, statusBg] = getStatusColors(status);
  return (
    <Link
      to={`/events/${slug}`}
      className={`${statusBg} grid gap-2 rounded-lg border border-amber-600 p-2 shadow-sm transition-shadow hover:shadow-md active:shadow sm:gap-4 sm:p-4 md:flex md:items-center md:justify-between`}
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
        {dateStart ? (
          <>
            <span>{new Date(dateStart).toDateString()}</span>
            {dateEnd !== dateStart && (
              <>
                <span className="text-amber-600">&gt;&gt;</span>
                <span>{new Date(dateEnd).toDateString()}</span>
              </>
            )}
          </>
        ) : (
          <span className="text-red-600">Missing date info</span>
        )}
      </div>
    </Link>
  );
};
