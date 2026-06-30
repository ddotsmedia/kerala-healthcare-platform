// Hospital directory list. Server component. Verified + published only.

import { resolveLocale, t } from '@/lib/i18n';
import { searchHospitals } from '@/lib/providers';
import SearchBar from '@/components/SearchBar';
import { HospitalCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  return {
    title: `${t(locale, 'hospitals')} · ${t(locale, 'site')}`,
    description: t(locale, 'find_hospital')
  };
}

export default async function HospitalsPage({ params, searchParams }) {
  const locale = resolveLocale(params.locale);
  const term = (searchParams && searchParams.q) || '';
  const page = (searchParams && searchParams.page) || 1;
  const hospitals = await searchHospitals({ term, page });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'find_hospital')}</h1>
      <SearchBar locale={locale} action={`/${locale}/hospitals`} defaultValue={term} />
      {hospitals.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">{t(locale, 'no_results')}</p>
      ) : (
        <div className="grid gap-3">
          {hospitals.map((h) => (
            <HospitalCard key={h.id} locale={locale} hospital={h} />
          ))}
        </div>
      )}
    </div>
  );
}
