// Advanced job search — sidebar filters, sort bar, rich job cards.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { searchJobs } from '@/lib/jobs';
import { listDistricts, listSpecialties } from '@/lib/providers';
import { DistrictFilter, SpecialtyFilter, EmptyState, Pagination } from '@khp/ui';
import JobCard from '@/components/jobs/JobCard';
import SaveSearchButton from '@/components/jobs/SaveSearchButton';

export const dynamic = 'force-dynamic';
const LIMIT = 20;
const TYPES = ['full_time', 'part_time', 'contract', 'locum', 'internship'];
const EXP = [['', 'All'], ['0', 'Fresher'], ['3', '1-3 yr'], ['5', '3-5 yr'], ['99', '5+ yr']];
const POSTED = [['', 'Any time'], ['1', '24 hrs'], ['7', 'Last week'], ['30', 'Last month']];
const SORTS = [['newest', 'Newest'], ['salary_high', 'Salary High'], ['salary_low', 'Salary Low'], ['closing_soon', 'Closing soon']];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'jobs')} · ${t(locale, 'site')}`, description: t(locale, 'job_search') };
}

function isoDaysAgo(days) {
  const d = new Date(Date.now() - parseInt(days, 10) * 86400000);
  return d.toISOString().slice(0, 10);
}

export default async function JobsFeed(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const opts = {
    term: sp.q || '', jobType: sp.type || '', districtId: sp.district || '', specialtyId: sp.specialty || '',
    experienceYearsMin: sp.exp || '', salaryMin: sp.salary_min || '', isRemote: sp.remote || '',
    isUrgent: sp.urgent || '', postedAfter: sp.posted ? isoDaysAgo(sp.posted) : '', sort: sp.sort || 'newest',
    page, limit: LIMIT
  };
  const [jobs, districts, specialties] = await Promise.all([searchJobs(opts), listDistricts(), listSpecialties()]);
  const basePath = `/${locale}/jobs`;
  const loginPath = `/${locale}/login`;
  const query = { q: sp.q, type: sp.type, district: sp.district, specialty: sp.specialty, exp: sp.exp, salary_min: sp.salary_min, remote: sp.remote, urgent: sp.urgent, posted: sp.posted, sort: sp.sort };
  const sortLink = (s) => `${basePath}?${new URLSearchParams({ ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)), sort: s }).toString()}`;

  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  const alertFilters = {};
  if (sp.q) alertFilters.term = sp.q;
  if (sp.type) alertFilters.job_type = sp.type;
  if (sp.specialty) alertFilters.specialty_id = sp.specialty;
  if (sp.district) alertFilters.district_id = sp.district;
  if (sp.salary_min && sp.salary_min !== '0') alertFilters.salary_min = sp.salary_min;
  if (sp.remote === '1') alertFilters.is_remote = true;
  if (sp.urgent === '1') alertFilters.is_urgent = true;

  const filters = (
    <form action={basePath} method="get" className="space-y-3">
      <input type="search" name="q" defaultValue={sp.q || ''} placeholder={t(locale, 'job_search')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-brand focus:outline-none" />
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'ജോലി തരം' : 'Job type'}</span>
        <select name="type" defaultValue={sp.type || ''} className={inp}>
          <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
          {TYPES.map((ty) => <option key={ty} value={ty}>{t(locale, ty)}</option>)}
        </select></label>
      <SpecialtyFilter specialties={specialties} selected={sp.specialty || ''} locale={locale} />
      <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'അനുഭവം' : 'Experience'}</span>
        <select name="exp" defaultValue={sp.exp || ''} className={inp}>{EXP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'കുറഞ്ഞ ശമ്പളം' : 'Min salary'}: ₹{sp.salary_min || '0'}</span>
        <input type="range" name="salary_min" min="0" max="500000" step="5000" defaultValue={sp.salary_min || '0'} className="mt-1 w-full" /></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'പോസ്റ്റ് ചെയ്തത്' : 'Posted'}</span>
        <select name="posted" defaultValue={sp.posted || ''} className={inp}>{POSTED.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="remote" value="1" defaultChecked={sp.remote === '1'} /> {ml ? 'റിമോട്ട്' : 'Remote'}</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="urgent" value="1" defaultChecked={sp.urgent === '1'} /> {ml ? 'അടിയന്തരം' : 'Urgent only'}</label>
      {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
      <button className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">{t(locale, 'search')}</button>
    </form>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'jobs')}</h1>

      {/* mobile filters */}
      <details className="rounded-xl border border-gray-200 bg-white p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-brand">{ml ? 'ഫിൽട്ടറുകൾ' : 'Filters'}</summary>
        <div className="mt-3">{filters}</div>
      </details>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-4">{filters}</div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SaveSearchButton filters={alertFilters} locale={locale} loginPath={loginPath} defaultName={sp.q || ''} />
            <Link href={`/${locale}/jobs/alerts`} className="text-sm font-medium text-brand hover:underline">
              {ml ? '🔔 അലേർട്ടുകൾ കൈകാര്യം ചെയ്യുക' : '🔔 Manage alerts'}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500">{ml ? 'ക്രമീകരിക്കുക:' : 'Sort:'}</span>
            {SORTS.map(([s, l]) => (
              <Link key={s} href={sortLink(s)} className={`rounded-full px-3 py-1 font-medium ${(sp.sort || 'newest') === s ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>{l}</Link>
            ))}
          </div>

          {jobs.length === 0 ? <EmptyState message={t(locale, 'no_results')} /> : (
            <>
              <div className="grid gap-3">
                {jobs.map((j) => <JobCard key={j.id} job={j} locale={locale} loginPath={loginPath} />)}
              </div>
              <Pagination basePath={basePath} query={query} page={page} hasNext={jobs.length === LIMIT} locale={locale} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
