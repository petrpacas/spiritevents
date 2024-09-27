import { Category } from "@prisma/client";
import { Link } from "@remix-run/react";
import React from "react";
import { EventStatus, getStatusColors } from "~/utils";

type Props = {
  categories: Category[];
  dateEnd: string;
  dateStart: string;
  id: string;
  isLanding?: boolean;
  location?: string;
  slug: string;
  status?: keyof typeof EventStatus;
  timeStart?: string;
  timeEnd?: string;
  title: string;
};

export const EventListCard = ({
  categories,
  dateEnd,
  dateStart,
  id,
  isLanding,
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
      {statusLetter && (
        <>
          <span className="text-amber-600">{statusLetter}</span>{" "}
        </>
      )}
      {title}
    </>
  );
  return (
    <Link
      to={`/events/${id}-${slug}`}
      className={`${statusBg} grid gap-2 rounded-lg border border-amber-600 p-2 shadow-sm transition-shadow hover:shadow-md active:shadow sm:p-4`}
    >
      {isLanding ? (
        <h3 className="text-xl font-medium leading-snug sm:text-2xl sm:leading-snug">
          {headingContent}
        </h3>
      ) : (
        <h4 className="text-xl font-medium leading-snug sm:text-2xl sm:leading-snug">
          {headingContent}
        </h4>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-x-2 leading-snug text-emerald-600 sm:text-lg sm:leading-snug">
          {categories.map((category, idx) => (
            <React.Fragment key={category.id}>
              {idx !== 0 && <span className="text-amber-600">~</span>}
              <span>{category.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="grid gap-2 leading-snug sm:text-lg sm:leading-snug lg:flex lg:items-end lg:justify-between lg:gap-4">
        <div className="grid min-[400px]:flex min-[400px]:gap-2">
          {dateStart ? (
            <>
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6"
                  width="16px"
                  height="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>{new Date(dateStart).toDateString()}</span>
              </div>
              {dateEnd && dateEnd !== dateStart ? (
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 rotate-90 opacity-50 sm:h-6 sm:w-6"
                    width="16px"
                    height="16px"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                    />
                  </svg>
                  <span>{new Date(dateEnd).toDateString()}</span>
                </div>
              ) : (
                timeStart && (
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6"
                      width="16px"
                      height="16px"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <span>{timeStart}</span>
                    {timeEnd && (
                      <>
                        <svg
                          className="h-5 w-5 rotate-90 opacity-50 sm:h-6 sm:w-6"
                          width="16px"
                          height="16px"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                          />
                        </svg>
                        <span>{timeEnd}</span>
                      </>
                    )}
                  </div>
                )
              )}
            </>
          ) : (
            <span className="text-red-600">Missing date info</span>
          )}
        </div>
        {location && <div className="text-amber-600">{location}</div>}
      </div>
    </Link>
  );
};
