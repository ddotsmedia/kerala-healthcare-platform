// Doctor directory list. Server component. Verified + published only.

import { resolveLocale, t } from '@/lib/i18n';
import { searchDoctors } from '@/lib/providers';
import SearchBar from '@/components/SearchBar';
import DoctorCard from '@/components/DoctorCard';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  return {
    title: `${t(locale, 'doctors')} · ${t(locale, 'site')}`,
    description: t(locale, 'find_doctor')
  };
}

export default async function DoctorsPage({ params, searchParams }) {
  const locale = resolveLocale(params.locale);
  const term = (searchParams && searchParams.q) || '';
  const page = (searchParams && searchParams.page) || 1;
  const doctors = await searchDoctors({ term, page });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'find_doctor')}</h1>
      <SearchBar locale={locale} action={`/${locale}/doctors`} defaultValue={term} />
      {doctors.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">{t(locale, 'no_results')}</p>
      ) : (
        <div className="grid gap-3">
          {doctors.map((d) => (
            <DoctorCard key={d.id} locale={locale} doctor={d} />
          ))}
        </div>
      )}
    </div>
  );
}
