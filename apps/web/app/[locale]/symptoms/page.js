// Symptom navigator — grid of symptom cards. Educational, not diagnostic.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { listSymptoms } from '@/lib/knowledge';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
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
      {symptoms.length === 0 ? <EmptyState message={t(locale, 'no_results')} /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {symptoms.map((s) => (
            <Link key={s.id} href={`/${locale}/symptoms/${s.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md">
              <span className="block text-sm font-medium">{locale === 'ml' ? s.name_ml : s.name_en}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
