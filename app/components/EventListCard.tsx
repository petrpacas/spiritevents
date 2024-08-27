import { Link } from "@remix-run/react";
import { EventStatus, getStatusColors } from "~/utils";

type Props = {
  country: string;
  dateEnd: string;
  dateStart: string;
  eventsIndex?: boolean;
  eventsIndexFiltersCountry?: boolean;
  eventsIndexFiltersStatus?: boolean;
  location?: string;
  slug: string;
  status?: keyof typeof EventStatus;
  timeStart?: string;
  timeEnd?: string;
  title: string;
};

export const EventListCard = ({
  country,
  dateEnd,
  dateStart,
  eventsIndex,
  eventsIndexFiltersCountry,
  eventsIndexFiltersStatus,
  location,
  slug,
  status,
  timeStart,
  timeEnd,
  title,
}: Props) => {
  const [statusLetter, statusBg] = getStatusColors(status);
  const headingContent = (
    <>
      {!eventsIndexFiltersStatus && statusLetter && (
        <span className="text-amber-600">{statusLetter} </span>
      )}
      {!eventsIndexFiltersCountry && (
        <span className="text-amber-600">({country}) </span>
      )}
      {title}
    </>
  );
  return (
    <Link
      to={`/events/${slug}`}
      className={`${statusBg} grid gap-2 rounded-lg border border-amber-600 p-2 shadow-sm transition-shadow hover:shadow-md active:shadow sm:gap-4 sm:p-4 md:flex md:items-center md:justify-between`}
    >
      {eventsIndex ? (
        <h4 className="text-xl sm:text-2xl">{headingContent}</h4>
      ) : (
        <h3 className="text-xl sm:text-2xl">{headingContent}</h3>
      )}
      <div className="grid max-md:gap-1 md:items-center md:justify-items-end">
        {location && (
          <div className="text-lg leading-snug text-amber-600 sm:text-xl sm:leading-snug">
            {location}
          </div>
        )}
        <div className="flex gap-2 leading-snug sm:text-lg sm:leading-snug md:items-center md:justify-center md:text-center">
          {dateStart ? (
            <>
              <span>{new Date(dateStart).toDateString()}</span>
              {dateEnd !== dateStart ? (
                <>
                  <span className="text-amber-600">&lt;&gt;</span>
                  <span>{new Date(dateEnd).toDateString()}</span>
                </>
              ) : (
                timeStart && (
                  <>
                    <span className="text-amber-600">&gt;&lt;</span>
                    {timeStart}
                    {timeEnd && ` - ${timeEnd}`}
                  </>
                )
              )}
            </>
          ) : (
            <span className="text-red-600">Missing date info</span>
          )}
        </div>
      </div>
    </Link>
  );
};
