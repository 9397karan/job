const Card = ({
  children,
  className = "",
  padding = true,
  hover = false,
}) => {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-base-300/70
        bg-base-100
        shadow-sm
        ${
          hover
            ? "hover:-translate-y-0.5 hover:shadow-md"
            : ""
        }
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;