export default function Loading() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-32 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    </div>
  );
}
