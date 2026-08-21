// Hospital directory list with filters + pagination. Server component.
// Verified + published only.

import { resolveLocale, t } from '@/lib/i18n';
import { searchHospitals, listDistricts } from '@/lib/providers';
import { HospitalCard, EmptyState, DistrictFilter, Pagination, CompareBar, VoiceSearch } from '@khp/ui';
import { listInsurers } from '@/lib/insurance';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

const SERVICES = ['mri', 'ct', 'icu', 'nicu', 'dialysis', 'ivf', 'cath_lab', 'lab', 'pharmacy', 'emergency'];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'hospitals')} · ${t(locale, 'site')}`, description: t(locale, 'find_hospital') };
}

export default async function HospitalsPage(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const filters = { term: sp.q || '', districtId: sp.district || '', serviceSlug: sp.service || '', insurer: sp.insurer || '' };

  const [hospitals, districts, insurers] = await Promise.all([
    searchHospitals({ ...filters, page, limit: LIMIT }),
    listDistricts(),
    listInsurers()
  ]);
  const basePath = `/${locale}/hospitals`;
  const query = { q: filters.term, district: filters.districtId, service: filters.serviceSlug, insurer: filters.insurer };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t(locale, 'find_hospital')}</h1>
        <a href={`/${locale}/compare`} className="text-sm font-medium text-brand hover:underline">⚖️ {locale === 'ml' ? 'താരതമ്യം ചെയ്യുക' : 'Compare'}</a>
      </div>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input type="search" name="q" defaultValue={filters.term} placeholder={t(locale, 'search_placeholder')}
                 className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
          <VoiceSearch locale={locale} />
        </div>
        {insurers.length > 0 && (
          <select name="insurer" defaultValue={filters.insurer} aria-label={locale === 'ml' ? 'ഇൻഷുറൻസ്' : 'Insurance'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="">{locale === 'ml' ? 'എല്ലാ ഇൻഷുറൻസും' : 'All insurance'}</option>
            {insurers.map((ins) => <option key={ins} value={ins}>{ins}</option>)}
          </select>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={filters.districtId} locale={locale} />
          <label className="block text-sm">
            <span className="text-gray-700">{t(locale, 'services')}</span>
            <select name="service" defaultValue={filters.serviceSlug} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">{locale === 'ml' ? 'എല്ലാം' : 'All'}</option>
              {SERVICES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          {t(locale, 'search')}
        </button>
      </form>

      {hospitals.length === 0 ? (
        <EmptyState message={t(locale, 'no_results')} />
      ) : (
        <>
          <div className="grid gap-3">
            {hospitals.map((h) => <HospitalCard key={h.id} locale={locale} hospital={h} compare />)}
          </div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={hospitals.length === LIMIT} locale={locale} />
        </>
      )}
      <CompareBar locale={locale} />
    </div>
  );
}
