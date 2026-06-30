// MedicalDisclaimer.js — non-dismissable medical disclaimer. Shown on every page.
// No close control by design (healthcare compliance).

import { t } from '@/lib/i18n';

export default function MedicalDisclaimer({ locale }) {
  return (
    <div
      role="note"
      aria-label="medical-disclaimer"
      className="border-t border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"
    >
      <p className="mx-auto max-w-3xl">{t(locale, 'disclaimer')}</p>
    </div>
  );
}
