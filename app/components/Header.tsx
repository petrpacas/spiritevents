import { Link, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientOnly } from "remix-utils/client-only";

type Props = {
  isAuthenticated: boolean;
  isLanding?: boolean;
};

export const Header = ({ isAuthenticated, isLanding }: Props) => {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuOpen]);
  useEffect(() => {
    if (navigation.state === "idle") {
      setIsMenuOpen(false);
    }
  }, [navigation]);
  const brandName = (
    <div className="relative z-10 font-bold leading-none max-[319px]:grid max-[319px]:text-[1.3125rem] min-[320px]:text-[1.75rem] min-[374px]:text-[2.1815rem] min-[428px]:text-[2.625rem]">
      <span className="text-amber-600">Seek</span>Gathering
    </div>
  );
  return (
    <>
      <header
        className={
          isLanding
            ? "absolute left-0 top-0 w-full"
            : "bg-amber-50 dark:bg-amber-950"
        }
      >
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between p-4 sm:px-8">
          <Link to="/">{isLanding ? <h1>{brandName}</h1> : brandName}</Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className={`${isMenuOpen ? "rounded-b-none border-amber-600 bg-white text-amber-600 dark:bg-stone-800" : "border-transparent bg-amber-600 text-white shadow-sm transition-shadow hover:shadow-md active:shadow"} relative z-40 flex items-center rounded border px-4 py-2 lg:hidden`}
          >
            <span className="sr-only">Menu</span>
            <svg
              className="h-6 w-6"
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <div
              className={`${isMenuOpen ? "" : "hidden"} absolute -bottom-[2px] left-0 right-0 h-[2px] bg-white dark:bg-stone-800`}
            />
          </button>
          <nav
            className={`${isMenuOpen ? "max-lg:grid" : "max-lg:hidden"} items-center max-lg:absolute max-lg:top-[3.625rem] max-lg:z-30 max-lg:gap-2 max-lg:rounded-md max-lg:rounded-tr-none max-lg:border max-lg:border-amber-600 max-lg:bg-white max-lg:p-4 max-sm:right-4 sm:max-lg:right-8 lg:relative lg:z-10 lg:flex lg:gap-4 dark:max-lg:bg-stone-800`}
          >
            {isAuthenticated && (
              <Link
                to="/events/new"
                className="flex items-center gap-2 rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
              >
                <span className="lg:sr-only">New event</span>
                <svg
                  className="h-6 w-6"
                  width="16px"
                  height="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </Link>
            )}
            <Link
              to="/events?country=CZ"
              className="flex items-center gap-2 rounded border border-transparent bg-amber-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center"
            >
              {isAuthenticated ? "Events in CZ" : "Events in Czechia"}
              <svg
                className="h-6 w-6"
                width="16px"
                height="16px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            </Link>
            <Link
              to="/events?category=festival"
              className="flex items-center gap-2 rounded border border-amber-600 bg-transparent px-4 py-2 text-amber-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center dark:text-white"
            >
              {isAuthenticated ? "All festivals" : "All the festivals"}
              <svg
                className="h-6 w-6"
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
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/Categories"
                  className="flex items-center gap-2 rounded border border-stone-600 px-4 py-2 text-stone-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center dark:border-white dark:text-white"
                >
                  <span className="lg:sr-only">Categories</span>
                  <svg
                    className="h-6 w-6"
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
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                </Link>
                <Link
                  to="/feedback"
                  className="flex items-center gap-2 rounded border border-stone-600 px-4 py-2 text-stone-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center dark:border-white dark:text-white"
                >
                  <span className="lg:sr-only">Feedback</span>
                  <svg
                    className="h-6 w-6"
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
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/events/suggest"
                  className="flex items-center gap-2 rounded border border-emerald-600 px-4 py-2 text-emerald-600 shadow-sm transition-shadow hover:shadow-md active:shadow max-lg:justify-center dark:text-white"
                >
                  Suggest event
                  <svg
                    className="h-6 w-6"
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
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </Link>
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
              className={`${isMenuOpen ? "absolute" : "hidden"} bottom-0 left-0 right-0 top-0 z-20 bg-black/50 lg:hidden dark:bg-white/50`}
              onClick={() => setIsMenuOpen(false)}
            />,
            document.body,
          )
        }
      </ClientOnly>
    </>
  );
};
