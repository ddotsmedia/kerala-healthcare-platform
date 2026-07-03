// Directory landing — search entry to doctors and hospitals.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import SearchBar from '@/components/SearchBar';

export default async function HomePage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-brand px-5 py-8 text-white">
        <h1 className="text-2xl font-bold">{t(locale, 'site')}</h1>
        <p className="mt-1 text-sm text-white/90">{t(locale, 'find_doctor')} · {t(locale, 'find_hospital')}</p>
        <div className="mt-4">
          <SearchBar locale={locale} action={`/${locale}/doctors`} />
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3">
        <Link href={`/${locale}/doctors`} className="rounded-xl border border-gray-200 bg-white p-5 text-center font-medium shadow-sm hover:shadow-md">
          {t(locale, 'doctors')}
        </Link>
        <Link href={`/${locale}/hospitals`} className="rounded-xl border border-gray-200 bg-white p-5 text-center font-medium shadow-sm hover:shadow-md">
          {t(locale, 'hospitals')}
        </Link>
      </section>
    </div>
  );
}
