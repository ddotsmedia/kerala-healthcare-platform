// Doctor directory list with filters + pagination. Server component.
// Verified + published only.

import { resolveLocale, t } from '@/lib/i18n';
import { searchDoctors, listDistricts, listSpecialties } from '@/lib/providers';
import { recordSearchLog } from '@/lib/analytics';
import { listInsurers } from '@/lib/insurance';
import {
  DoctorCard, EmptyState, DistrictFilter, SpecialtyFilter,
  ConsultationModeFilter, Pagination, VoiceSearch
} from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'doctors')} · ${t(locale, 'site')}`, description: t(locale, 'find_doctor') };
}

export default async function DoctorsPage(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const filters = {
    term: sp.q || '', districtId: sp.district || '', specialtyId: sp.specialty || '',
    consultationMode: sp.mode || '', language: sp.language || '', insurer: sp.insurer || ''
  };

  const [doctors, districts, specialties, insurers] = await Promise.all([
    searchDoctors({ ...filters, page, limit: LIMIT }),
    listDistricts(),
    listSpecialties(),
    listInsurers()
  ]);
  const basePath = `/${locale}/doctors`;
  const query = { q: filters.term, district: filters.districtId, specialty: filters.specialtyId, mode: filters.consultationMode, language: filters.language, insurer: filters.insurer };

  // Log directory searches (query and/or filters) for search analytics — page 1 only.
  if (page === 1 && (filters.term || filters.specialtyId || filters.districtId || filters.consultationMode || filters.language)) {
    const usedFilters = {};
    if (filters.specialtyId) usedFilters.specialty_id = filters.specialtyId;
    if (filters.districtId) usedFilters.district_id = filters.districtId;
    if (filters.consultationMode) usedFilters.mode = filters.consultationMode;
    if (filters.language) usedFilters.language = filters.language;
    recordSearchLog({ query: filters.term || '(filters only)', locale, resultCount: doctors.length, filters: usedFilters });
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'find_doctor')}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input type="search" name="q" defaultValue={filters.term} placeholder={t(locale, 'search_placeholder')}
                 className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
          <VoiceSearch locale={locale} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SpecialtyFilter specialties={specialties} selected={filters.specialtyId} locale={locale} />
          <DistrictFilter districts={districts} selected={filters.districtId} locale={locale} />
          <ConsultationModeFilter selected={filters.consultationMode} locale={locale} />
        </div>
        {insurers.length > 0 && (
          <select name="insurer" defaultValue={filters.insurer} aria-label={locale === 'ml' ? 'ഇൻഷുറൻസ്' : 'Insurance'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="">{locale === 'ml' ? 'എല്ലാ ഇൻഷുറൻസും' : 'All insurance'}</option>
            {insurers.map((ins) => <option key={ins} value={ins}>{ins}</option>)}
          </select>
        )}
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          {t(locale, 'search')}
        </button>
      </form>

      {doctors.length === 0 ? (
        <EmptyState message={t(locale, 'no_results')} />
      ) : (
        <>
          <div className="grid gap-3">
            {doctors.map((d) => <DoctorCard key={d.id} locale={locale} doctor={d} />)}
          </div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={doctors.length === LIMIT} locale={locale} />
        </>
      )}
    </div>
  );
}
