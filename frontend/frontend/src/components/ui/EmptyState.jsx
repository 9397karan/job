import { Inbox } from "lucide-react";

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center">

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon
          size={27}
          className="text-primary"
        />
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-base-content/60">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  );
};

export default EmptyState;