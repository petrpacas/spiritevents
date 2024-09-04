import { Category } from "@prisma/client";
import { Link } from "@remix-run/react";
import React from "react";
import { EventStatus, getStatusColors } from "~/utils";

type Props = {
  categories: Category[];
  country: string;
  dateEnd: string;
  dateStart: string;
  eventsIndex?: boolean;
  eventsIndexFiltersCountry?: boolean;
  eventsIndexFiltersStatus?: boolean;
  id: string;
  location?: string;
  slug: string;
  status?: keyof typeof EventStatus;
  timeStart?: string;
  timeEnd?: string;
  title: string;
};

export const EventListCard = ({
  categories,
  country,
  dateEnd,
  dateStart,
  eventsIndex,
  eventsIndexFiltersCountry,
  eventsIndexFiltersStatus,
  id,
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
      to={`/events/${slug}-${id}`}
      className={`${statusBg} grid gap-2 rounded-lg border border-amber-600 p-2 shadow-sm transition-shadow hover:shadow-md active:shadow sm:p-4`}
    >
      {eventsIndex ? (
        <h4 className="text-xl font-medium sm:text-2xl">{headingContent}</h4>
      ) : (
        <h3 className="text-xl font-medium sm:text-2xl">{headingContent}</h3>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 leading-snug text-emerald-600 sm:text-lg sm:leading-snug">
          {categories.map((category, idx) => (
            <React.Fragment key={category.id}>
              {idx !== 0 && <span className="text-amber-600">~</span>}
              <span>{category.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="grid gap-2 lg:flex lg:items-end lg:justify-between lg:gap-4">
        <div className="grid leading-snug min-[414px]:flex min-[414px]:gap-2 sm:text-lg sm:leading-snug">
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
                    <span className="text-amber-600">&gt;&gt;</span>
                    <span>{timeStart}</span>
                    {timeEnd && (
                      <>
                        <span className="text-amber-600">&gt;&lt;</span>
                        <span>{timeEnd}</span>
                      </>
                    )}
                  </>
                )
              )}
            </>
          ) : (
            <span className="text-red-600">Missing date info</span>
          )}
        </div>
        {location && (
          <div className="text-lg leading-snug text-amber-600 sm:text-xl sm:leading-snug">
            {location}
          </div>
        )}
      </div>
    </Link>
  );
};
