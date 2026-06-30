// ListingStatusBadge.js — presentational listing-state pill. Locale-agnostic.

const STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-brand/10 text-brand',
  unlisted: 'bg-yellow-100 text-yellow-800'
};

export default function ListingStatusBadge({ status, label }) {
  const cls = STYLES[status] || STYLES.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label || status}
    </span>
  );
}
