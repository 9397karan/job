const Input = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="form-control w-full">

      {label && (
        <label className="mb-2">
          <span className="text-sm font-semibold text-base-content">
            {label}
          </span>
        </label>
      )}

      <input
        className={`
          input
          input-bordered
          w-full
          rounded-xl
          bg-base-100
          focus:border-primary
          focus:outline-none
          focus:ring-2
          focus:ring-primary/10
          ${error ? "input-error" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-xs text-error">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-xs text-base-content/50">
          {helperText}
        </p>
      )}

    </div>
  );
};

export default Input;