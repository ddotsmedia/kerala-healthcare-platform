// KnowledgeDisclaimer.js — persistent, non-dismissable disclaimer for all
// health-knowledge pages. No close control by design.

import { t } from '@/lib/i18n';

export default function KnowledgeDisclaimer({ locale }) {
  return (
    <div role="note" aria-label="medical-disclaimer"
      className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
      {t(locale, 'disclaimer')}
    </div>
  );
}
