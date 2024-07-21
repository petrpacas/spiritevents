import React from "react";
import { countries } from "../utils/countries";

interface CountrySelect {
  className?: string;
  defaultValue?: string;
  filteredCountries?: typeof countries;
}

export const CountrySelect: React.FC<CountrySelect> = ({
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
        className={`col-start-1 row-start-1 appearance-none ${className || ""}`}
      >
        {!defaultValue && <option value="">Select a country</option>}
        {countriesObject.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none relative right-1 col-start-1 row-start-1 h-4 w-4 self-center justify-self-end forced-colors:hidden"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
  );
};
