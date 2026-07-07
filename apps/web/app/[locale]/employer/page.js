// Employer overview. Requires login + employer_profile (inline create if missing).

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { currentEmployerProfile } from '@/lib/jobs';
import { listMyJobs } from '@/lib/employer';
import { listDistricts } from '@/lib/providers';
import { createProfileAction } from './actions';

export const dynamic = 'force-dynamic';
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default async function EmployerHome(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const emp = await currentEmployerProfile();

  if (!emp) {
    const districts = await listDistricts();
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{t(locale, 'employer')}</h1>
        <form action={createProfileAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <input type="hidden" name="locale" value={locale} />
          <p className="text-sm text-gray-600">Create your employer profile to post jobs.</p>
          <input name="org_name" placeholder="Organisation name" required className={inp} />
          <input name="org_type" placeholder="Type (hospital, clinic…)" className={inp} />
          <select name="district_id" className={inp}><option value="">District…</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</select>
          <input name="website" placeholder="Website" className={inp} />
          <textarea name="description" placeholder="About" rows={3} className={inp} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Create profile</button>
        </form>
      </div>
    );
  }

  const jobs = await listMyJobs();
  const active = jobs.filter((j) => j.status === 'active').length;
  const apps = jobs.reduce((n, j) => n + Number(j.application_count), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{emp.org_name}</h1>
        <Link href={`/${locale}/employer/listings/new`} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white">{t(locale, 'post_job')}</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-brand">{active}</p><p className="text-xs text-gray-500">Active listings</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-brand">{apps}</p><p className="text-xs text-gray-500">{t(locale, 'applications')}</p></div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link href={`/${locale}/employer/listings`} className="text-sm text-brand underline">Manage listings →</Link>
        <Link href={`/${locale}/employer/candidates`} className="text-sm text-brand underline">{locale === 'ml' ? 'ഉദ്യോഗാർത്ഥികളെ തിരയുക' : 'Search candidates'} →</Link>
      </div>
    </div>
  );
}
