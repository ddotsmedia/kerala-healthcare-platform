// Symptom navigator — searchable, grouped by body area. Educational, not diagnostic.

import { resolveLocale, t } from '@/lib/i18n';
import { listSymptoms } from '@/lib/knowledge';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
import SymptomsGrid from '@/components/health/SymptomsGrid';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';
export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'symptom_navigator')} · ${t(locale, 'site')}` };
}

export default async function SymptomsPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const symptoms = await listSymptoms();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'symptom_navigator')}</h1>
      <KnowledgeDisclaimer locale={locale} />
      {symptoms.length === 0
        ? <EmptyState message={t(locale, 'no_results')} />
        : <SymptomsGrid symptoms={symptoms} locale={locale} />}
    </div>
  );
}
