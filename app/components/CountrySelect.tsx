import type { FC } from "react";
import { countries } from "~/utils";

type Props = {
  className?: string;
  defaultValue?: string;
  filteredCountries?: typeof countries;
};

export const CountrySelect: FC<Props> = ({
  className,
  defaultValue,
  filteredCountries,
}) => {
  const countriesObject = filteredCountries || countries;
  return (
    <div className="grid">
      <select
        name="country"
        id="country"
        defaultValue={defaultValue}
        className={`col-start-1 row-start-1 w-full appearance-none${` ${className}` || ""}`}
      >
        {!defaultValue && (
          <option value="">
            {filteredCountries ? "all countries" : "Select a country"}
          </option>
        )}
        {countriesObject.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      <svg
        className={`pointer-events-none relative col-start-1 row-start-1 h-4 w-4 self-center justify-self-end forced-colors:hidden ${filteredCountries ? "right-1" : "right-4"}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>
  );
};
