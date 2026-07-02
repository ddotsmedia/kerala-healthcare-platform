// Post a new job listing.

import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { currentEmployerProfile } from '@/lib/jobs';
import { listDistricts } from '@/lib/providers';
import { createJobAction } from '../../actions';

export const dynamic = 'force-dynamic';
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
const TYPES = ['full_time', 'part_time', 'contract', 'locum'];

export default async function NewJob({ params }) {
  const locale = resolveLocale(params.locale);
  if (!getSession()) redirect(`/${locale}/login`);
  if (!(await currentEmployerProfile())) redirect(`/${locale}/employer`);
  const districts = await listDistricts();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'post_job')}</h1>
      <form action={createJobAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="hidden" name="locale" value={locale} />
        <input name="title" placeholder="Job title" required className={inp} />
        <input name="role_category" placeholder="Role (nurse, doctor…)" className={inp} />
        <div className="grid grid-cols-2 gap-2">
          <select name="district_id" className={inp}><option value="">District…</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</select>
          <select name="employment_type" className={inp}>{TYPES.map((ty) => <option key={ty} value={ty}>{t(locale, ty)}</option>)}</select>
        </div>
        <input name="experience_years_min" type="number" min="0" placeholder="Min experience (yrs)" className={inp} />
        <textarea name="description" placeholder="Description" rows={4} className={inp} />
        <textarea name="requirements" placeholder="Requirements" rows={3} className={inp} />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">{t(locale, 'post_job')}</button>
      </form>
    </div>
  );
}
