// Job listings feed with filters. Active listings only.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { searchJobs } from '@/lib/jobs';
import { listDistricts } from '@/lib/providers';
import { DistrictFilter, EmptyState, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;
const TYPES = ['full_time', 'part_time', 'contract', 'locum'];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'jobs')} · ${t(locale, 'site')}`, description: t(locale, 'job_search') };
}

export default async function JobsFeed(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const filters = { term: sp.q || '', districtId: sp.district || '', employmentType: sp.type || '' };
  const [jobs, districts] = await Promise.all([searchJobs({ ...filters, page, limit: LIMIT }), listDistricts()]);
  const basePath = `/${locale}/jobs`;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'jobs')}</h1>
      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={filters.term} placeholder={t(locale, 'job_search')}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={filters.districtId} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{t(locale, 'employment_type')}</span>
            <select name="type" defaultValue={filters.employmentType} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">{locale === 'ml' ? 'എല്ലാം' : 'All'}</option>
              {TYPES.map((ty) => <option key={ty} value={ty}>{t(locale, ty)}</option>)}
            </select>
          </label>
        </div>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">{t(locale, 'search')}</button>
      </form>

      {jobs.length === 0 ? <EmptyState message={t(locale, 'no_results')} /> : (
        <>
          <div className="grid gap-3">
            {jobs.map((j) => (
              <Link key={j.id} href={`/${locale}/jobs/${j.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
                <h3 className="font-semibold">{j.title}</h3>
                <p className="text-sm text-brand">{j.org_name}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-600">
                  <span>{locale === 'ml' ? j.district_ml : j.district_en}</span>
                  <span>{t(locale, j.employment_type)}</span>
                  <span>{j.experience_years_min}+ {t(locale, 'years')}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination basePath={basePath} query={{ q: filters.term, district: filters.districtId, type: filters.employmentType }} page={page} hasNext={jobs.length === LIMIT} locale={locale} />
        </>
      )}
    </div>
  );
}
