const Select = ({
  label,
  options = [],
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="form-control w-full">

      {label && (
        <label className="mb-2">
          <span className="text-sm font-semibold">
            {label}
          </span>
        </label>
      )}

      <select
        className={`
          select
          select-bordered
          w-full
          rounded-xl
          bg-base-100
          focus:border-primary
          focus:outline-none
          focus:ring-2
          focus:ring-primary/10
          ${error ? "select-error" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-xs text-error">
          {error}
        </p>
      )}

    </div>
  );
};

export default Select;