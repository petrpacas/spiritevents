import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientOnly } from "remix-utils/client-only";

type Props = {
  isAuthenticated: boolean;
  isLanding?: boolean;
};

export const Header = ({ isAuthenticated, isLanding }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);
  const brandName = (
    <div className="relative z-10 font-bold leading-none max-[319px]:grid max-[319px]:text-[1.3125rem] min-[320px]:text-[1.75rem] min-[374px]:text-[2.1815rem] min-[428px]:text-[2.625rem]">
      <span className="text-amber-600">Seek</span>Gathering
    </div>
  );
  return (
    <>
      <header
        className={`${isLanding ? "absolute top-0 w-full" : "bg-amber-50"}`}
      >
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between p-4 sm:px-8">
          <Link to="/">{isLanding ? <h1>{brandName}</h1> : brandName}</Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className={`${isMenuOpen ? "rounded-b-none border-amber-600 bg-white text-amber-600" : "border-transparent bg-amber-600 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"} relative z-40 flex items-center rounded border px-4 py-2 lg:hidden`}
          >
            <span className="sr-only">Menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <div
              className={`${isMenuOpen ? "" : "hidden"}absolute -bottom-[2px] left-0 right-0 h-[2px] bg-white`}
            />
          </button>
          <nav
            className={`${isMenuOpen ? "max-lg:grid" : "max-lg:hidden"} items-center max-lg:absolute max-lg:top-[3.625rem] max-lg:z-30 max-lg:gap-2 max-lg:rounded-md max-lg:rounded-tr-none max-lg:border max-lg:border-amber-600 max-lg:bg-white max-lg:p-4 max-sm:right-4 sm:max-lg:right-8 lg:relative lg:z-10 lg:flex lg:gap-4`}
          >
            <Link
              to="/events"
              className="flex items-center gap-2 rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
            >
              Upcoming events
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/events/new"
                  className="flex items-center gap-2 rounded border border-emerald-600 bg-transparent px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
                >
                  Add event
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </Link>
                {/* <Link
                to="/feedback/check"
                className="flex items-center gap-2 rounded border border-sky-600 px-4 py-2 text-sky-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
              >
                Check feedback
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </Link> */}
              </>
            ) : (
              <>
                <Link
                  to="/events/suggest"
                  className="flex items-center gap-2 rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
                >
                  Suggest event
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </Link>
                {/* <Link
                to="/feedback"
                className="flex items-center gap-2 rounded border border-sky-600 px-4 py-2 text-sky-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
              >
                Give feedback
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </Link> */}
              </>
            )}
          </nav>
        </div>
      </header>
      <ClientOnly>
        {() =>
          createPortal(
            <button
              type="button"
              className={`${isMenuOpen ? "absolute" : "hidden"} bottom-0 left-0 right-0 top-0 z-20 bg-black/50 lg:hidden`}
              onClick={() => setIsMenuOpen(false)}
            />,
            document.body,
          )
        }
      </ClientOnly>
    </>
  );
};
