const Badge = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const variants = {
    primary: "badge-primary",
    secondary: "badge-secondary",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info",
    neutral: "badge-neutral",
    ghost: "badge-ghost",
  };

  return (
    <span
      className={`badge ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;