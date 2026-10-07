const Skeleton = ({
  className = "",
}) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-base-300 ${className}`}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
};

export default Skeleton;