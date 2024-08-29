type Options = {
  name: string;
  code: string;
}[];

type Props = {
  options: Options;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  emptyOption?: string;
  id?: string;
  name?: string;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};

export const Select = ({
  options,
  className,
  defaultValue,
  disabled,
  emptyOption,
  id,
  name,
  required,
  onChange,
}: Props) => {
  return (
    <select
      required={required}
      autoComplete="off"
      name={name}
      id={id}
      defaultValue={defaultValue}
      className={className}
      onChange={onChange}
      disabled={disabled}
    >
      {emptyOption && (
        <option value="" disabled={required}>
          {emptyOption}
        </option>
      )}
      {options.map((option, idx) => (
        <option key={`${option.code}-${idx}`} value={option.code}>
          {option.name}
        </option>
      ))}
    </select>
  );
};
