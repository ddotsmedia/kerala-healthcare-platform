// Candidate overview — active applications + saved jobs. Inline profile create.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { currentCandidateProfile } from '@/lib/jobs';
import { listMyApplications, myNotifications } from '@/lib/applications';
import { listSavedJobs } from '@/lib/candidate';
import { listDistricts } from '@/lib/providers';
import { saveProfileAction } from './actions';

export const dynamic = 'force-dynamic';
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default async function CandidateHome(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const cand = await currentCandidateProfile();

  if (!cand) {
    const districts = await listDistricts();
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{t(locale, 'candidate')}</h1>
        <form action={saveProfileAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <input type="hidden" name="locale" value={locale} />
          <p className="text-sm text-gray-600">Create your candidate profile.</p>
          <input name="headline" placeholder="Headline" required className={inp} />
          <input name="role_category" placeholder="Role (nurse, doctor…)" className={inp} />
          <select name="district_id" className={inp}><option value="">District…</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</select>
          <input name="experience_years" type="number" min="0" placeholder="Experience (yrs)" className={inp} />
          <textarea name="summary" placeholder="Summary" rows={3} className={inp} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_open_to_work" defaultChecked /> {t(locale, 'open_to_work')}</label>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Create profile</button>
        </form>
      </div>
    );
  }

  const [apps, saved, notifs] = await Promise.all([listMyApplications(), listSavedJobs(), myNotifications()]);
  const active = apps.filter((a) => !['withdrawn', 'rejected'].includes(a.status)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{cand.headline || t(locale, 'candidate')}</h1>
        <Link href={`/${locale}/candidate/profile`} className="text-sm text-brand">Edit profile</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/${locale}/candidate/applications`} className="rounded-xl border border-gray-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-brand">{active}</p><p className="text-xs text-gray-500">{t(locale, 'my_applications')}</p></Link>
        <Link href={`/${locale}/candidate/saved`} className="rounded-xl border border-gray-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-brand">{saved.length}</p><p className="text-xs text-gray-500">{t(locale, 'saved_jobs')}</p></Link>
      </div>
      <Link href={`/${locale}/candidate/resume`} className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 px-4 py-3">
        <span className="text-sm font-semibold text-brand">📄 {locale === 'ml' ? 'റെസ്യൂം തയ്യാറാക്കുക' : 'Build Resume'}</span>
        <span className="text-brand">→</span>
      </Link>
      {notifs.length > 0 && (
        <section><h2 className="mb-2 text-sm font-semibold text-gray-700">Notifications</h2>
          <ul className="space-y-1 text-sm">{notifs.slice(0, 5).map((n) => <li key={n.id} className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700">{n.body}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
