// VerificationBadge.js — verified | pending | unverified states. Bilingual label.

const LABELS = {
  verified: { ml: 'പരിശോധിച്ചു', en: 'Verified' },
  pending: { ml: 'പരിശോധനയിൽ', en: 'Pending' },
  unverified: { ml: 'പരിശോധിച്ചിട്ടില്ല', en: 'Unverified' }
};
const STYLES = {
  verified: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  unverified: 'bg-gray-100 text-gray-600'
};

export default function VerificationBadge({ status = 'unverified', locale = 'ml' }) {
  const key = LABELS[status] ? status : 'unverified';
  const label = (LABELS[key][locale] || LABELS[key].en);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[key]}`}>
      {key === 'verified' && <span aria-hidden="true">✓</span>}
      {label}
    </span>
  );
}
