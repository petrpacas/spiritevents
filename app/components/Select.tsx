type Options = {
  name: string;
  code: string;
  disabled?: boolean;
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
  value?: string;
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
  value,
  onChange,
}: Props) => {
  return (
    <select
      required={required}
      autoComplete="off"
      name={name}
      id={id}
      defaultValue={defaultValue}
      value={value}
      className={className}
      onChange={onChange}
      disabled={disabled}
    >
      {emptyOption && (
        <option
          value=""
          selected={required && !defaultValue}
          disabled={required}
        >
          {emptyOption}
        </option>
      )}
      {options.map((option, idx) => (
        <option
          key={`${option.code}-${idx}`}
          value={option.code}
          disabled={option.disabled}
        >
          {option.name}
        </option>
      ))}
    </select>
  );
};
