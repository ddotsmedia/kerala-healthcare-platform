// VerifiedBadge.js — trust signal shown on verified providers only.

import { t } from '@/lib/i18n';

export default function VerifiedBadge({ locale }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
      <span aria-hidden="true">✓</span>
      {t(locale, 'verified')}
    </span>
  );
}
