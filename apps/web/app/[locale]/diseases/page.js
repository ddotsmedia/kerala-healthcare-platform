// A–Z disease index (published diseases).

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { listDiseases } from '@/lib/knowledge';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';
export function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'diseases')} · ${t(locale, 'site')}` };
}

export default async function DiseaseIndex({ params }) {
  const locale = resolveLocale(params.locale);
  const diseases = await listDiseases();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'diseases')}</h1>
      <KnowledgeDisclaimer locale={locale} />
      {diseases.length === 0 ? <EmptyState message={t(locale, 'no_results')} /> : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {diseases.map((d) => (
            <li key={d.slug}>
              <Link href={`/${locale}/diseases/${d.slug}`} className="block px-4 py-3 text-sm hover:bg-gray-50">
                {locale === 'ml' ? (d.title_ml || d.title_en) : d.title_en}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
