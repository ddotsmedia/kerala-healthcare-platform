// CardSkeleton.js — pulse placeholders (no layout shift). Pure.

export function DoctorCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4" aria-hidden="true">
      <div className="flex gap-3">
        <div className="skeleton h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton mt-3 h-8 w-full" />
    </div>
  );
}

export function HospitalCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4" aria-hidden="true">
      <div className="flex gap-3">
        <div className="skeleton h-12 w-12 rounded" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-hidden="true">
      <div className="skeleton h-36 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}

const MAP = { doctor: DoctorCardSkeleton, hospital: HospitalCardSkeleton, article: ArticleCardSkeleton };

export function CardGridSkeleton({ count = 6, kind = 'doctor' }) {
  const S = MAP[kind] || DoctorCardSkeleton;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => <S key={i} />)}
    </div>
  );
}
