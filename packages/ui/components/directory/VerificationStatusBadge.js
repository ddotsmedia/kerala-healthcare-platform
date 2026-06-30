// VerificationStatusBadge.js — presentational status pill. Locale-agnostic (label via prop).

const STYLES = {
  pending: 'bg-gray-100 text-gray-700',
  in_review: 'bg-amber-100 text-amber-800',
  verified: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function VerificationStatusBadge({ status, label }) {
  const cls = STYLES[status] || STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status === 'verified' && <span aria-hidden="true">✓</span>}
      {label || status}
    </span>
  );
}
