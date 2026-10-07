const PageHeader = ({
  title,
  description,
  action,
  breadcrumb,
}) => {
  return (
    <div className="mb-7">

      {breadcrumb && (
        <div className="mb-2 text-sm text-base-content/50">
          {breadcrumb}
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-base-content/60 md:text-base">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}

      </div>

    </div>
  );
};

export default PageHeader;