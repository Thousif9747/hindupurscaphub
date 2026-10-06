export function CardSkeleton({ className = '' }) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="skeleton h-28 w-full rounded-2xl" />
      <div className="skeleton mt-4 h-4 w-2/3" />
      <div className="skeleton mt-2 h-3 w-1/3" />
      <div className="skeleton mt-4 h-9 w-full rounded-full" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LineSkeleton({ className = '' }) {
  return <div className={`skeleton h-4 rounded-full ${className}`} />;
}
