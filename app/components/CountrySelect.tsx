import { countries } from "~/utils";

type Props = {
  className?: string;
  defaultValue?: string;
  filteredCountries?: typeof countries;
};

export const CountrySelect = ({
  className,
  defaultValue,
  filteredCountries,
}: Props) => {
  const countriesObject = filteredCountries || countries;
  return (
    <select
      name="country"
      id="country"
      defaultValue={defaultValue}
      className={className}
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
  );
};
