import { CardGridSkeleton } from '@khp/ui';

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-7 w-40" />
      <div className="skeleton h-28 w-full" />
      <CardGridSkeleton count={6} kind="doctor" />
    </div>
  );
}
