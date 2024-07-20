import React from "react";
import { countries } from "../utils/countries";

interface CountrySelect {
  defaultValue?: string;
  filteredCountries?: typeof countries;
}

export const CountrySelect: React.FC<CountrySelect> = ({
  defaultValue,
  filteredCountries,
}) => {
  const countriesObject = filteredCountries || countries;
  return (
    <select name="country" id="country" defaultValue={defaultValue}>
      {!defaultValue && <option value="">Select a country</option>}
      {countriesObject.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
};
