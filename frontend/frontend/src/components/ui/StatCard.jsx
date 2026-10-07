const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "text-primary",
  iconBg = "bg-primary/10",
}) => {
  return (
    <div className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-base-content/60">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-base-content/50">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon
              size={21}
              className={iconClass}
            />
          </div>
        )}

      </div>

    </div>
  );
};

export default StatCard;