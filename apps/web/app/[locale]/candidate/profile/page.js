// Candidate profile edit.

import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { currentCandidateProfile } from '@/lib/jobs';
import { listDistricts } from '@/lib/providers';
import { saveProfileAction } from '../actions';

export const dynamic = 'force-dynamic';
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default async function CandidateProfileEdit(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const c = await currentCandidateProfile();
  if (!c) redirect(`/${locale}/candidate`);
  const districts = await listDistricts();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Edit profile</h1>
      <form action={saveProfileAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="hidden" name="locale" value={locale} />
        <input name="headline" defaultValue={c.headline || ''} placeholder="Headline" className={inp} />
        <input name="role_category" defaultValue={c.role_category || ''} placeholder="Role" className={inp} />
        <select name="district_id" defaultValue={c.district_id || ''} className={inp}><option value="">District…</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</select>
        <input name="experience_years" type="number" min="0" defaultValue={c.experience_years ?? ''} className={inp} />
        <textarea name="summary" defaultValue={c.summary || ''} rows={3} className={inp} />
        <input name="resume_url" defaultValue={c.resume_url || ''} placeholder="Resume URL" className={inp} />
        <input name="linkedin_url" defaultValue={c.linkedin_url || ''} placeholder="LinkedIn URL" className={inp} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_open_to_work" defaultChecked={c.is_open_to_work} /> {t(locale, 'open_to_work')}</label>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Save</button>
      </form>
    </div>
  );
}
