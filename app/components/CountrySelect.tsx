import { countries as allCountries } from "~/utils";

type Props = {
  className?: string;
  countries?: typeof allCountries;
  defaultValue?: string;
};

export const CountrySelect = ({
  className,
  countries,
  defaultValue,
}: Props) => {
  const countryObjects = countries || allCountries;
  return (
    <select
      autoComplete="off"
      name="country"
      id="country"
      defaultValue={defaultValue}
      className={className}
    >
      {countries ? (
        <option value="">all countries</option>
      ) : !defaultValue ? (
        <option value="">Select a country</option>
      ) : undefined}
      {countryObjects.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
};
