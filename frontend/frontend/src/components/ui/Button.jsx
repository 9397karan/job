const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  type = "button",
  disabled = false,
  onClick,
}) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    success: "btn-success",
    error: "btn-error",
    warning: "btn-warning",
    info: "btn-info",
  };

  const sizes = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <span className="loading loading-spinner loading-sm" />
      )}

      {children}
    </button>
  );
};

export default Button;