// Recruiter candidate search — filters + result cards (NO contact fields).
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { currentEmployerProfile } from '@/lib/jobs';
import { searchCandidates } from '@/lib/recruiter';
import { listDistricts, listSpecialties } from '@/lib/providers';
import { DistrictFilter, SpecialtyFilter, EmptyState } from '@khp/ui';
import CandidateCard from '@/components/jobs/CandidateCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: locale === 'ml' ? 'ഉദ്യോഗാർത്ഥികളെ തിരയുക' : 'Search Candidates' };
}

export default async function CandidateSearch(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  if (!(await getSession())) redirect(`/${locale}/login`);
  if (!(await currentEmployerProfile())) redirect(`/${locale}/employer`);

  const filters = {
    term: sp.q || '', roleCategory: sp.role || '', specialtyId: sp.specialty || '', districtId: sp.district || '',
    jobType: sp.job_type || '', experienceYearsMin: sp.exp_min || '', expectedSalaryMax: sp.salary_max || ''
  };
  const opts = { ...filters, sort: sp.sort || 'recent', page: sp.page || 1, limit: 20, filters };
  const [res, districts, specialties] = await Promise.all([searchCandidates(opts), listDistricts(), listSpecialties()]);
  const rows = res ? res.rows : [];
  const basePath = `/${locale}/employer/candidates`;
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  const form = (
    <form action={basePath} method="get" className="space-y-3">
      <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'തലക്കെട്ട്, റോൾ…' : 'Headline, role…'} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base" />
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'റോൾ' : 'Role'}</span>
        <input name="role" defaultValue={sp.role || ''} placeholder={ml ? 'നഴ്സ്, ഡോക്ടർ…' : 'nurse, doctor…'} className={inp} /></label>
      <SpecialtyFilter specialties={specialties} selected={sp.specialty || ''} locale={locale} />
      <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'കുറഞ്ഞ പരിചയം (വർഷം)' : 'Min experience (yrs)'}</span>
        <input name="exp_min" type="number" min="0" defaultValue={sp.exp_min || ''} className={inp} /></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'പരമാവധി പ്രതീക്ഷിത ശമ്പളം' : 'Max expected salary'}</span>
        <input name="salary_max" type="number" min="0" step="5000" defaultValue={sp.salary_max || ''} className={inp} /></label>
      <button className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">{ml ? 'തിരയുക' : 'Search'}</button>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{ml ? 'ഉദ്യോഗാർത്ഥികളെ തിരയുക' : 'Search Candidates'}</h1>
        <Link href={`/${locale}/employer`} className="text-sm text-brand">{ml ? 'ഡാഷ്ബോർഡ്' : 'Dashboard'}</Link>
      </div>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">🔒 {ml ? 'കോൺടാക്റ്റ് വിവരങ്ങൾ ഉദ്യോഗാർത്ഥി അംഗീകരിച്ചാൽ മാത്രം ദൃശ്യമാകും.' : 'Contact details appear only after a candidate accepts your request.'}</p>

      <details className="rounded-xl border border-gray-200 bg-white p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-brand">{ml ? 'ഫിൽട്ടറുകൾ' : 'Filters'}</summary>
        <div className="mt-3">{form}</div>
      </details>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-4">{form}</div></aside>
        <div className="space-y-3">
          {rows.length === 0 ? <EmptyState message={ml ? 'ഫലങ്ങളൊന്നുമില്ല' : 'No candidates found'} /> :
            rows.map((c) => <CandidateCard key={c.id} candidate={c} locale={locale} />)}
        </div>
      </div>
    </div>
  );
}
