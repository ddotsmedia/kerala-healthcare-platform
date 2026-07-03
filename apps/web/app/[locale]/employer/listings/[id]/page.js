// Edit a job listing.

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { getMyJob } from '@/lib/employer';
import { updateJobAction } from '../../actions';

export const dynamic = 'force-dynamic';
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
const TYPES = ['full_time', 'part_time', 'contract', 'locum'];

export default async function EditJob(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const j = await getMyJob(params.id);
  if (!j) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{j.title}</h1>
        <Link href={`/${locale}/employer/listings/${j.id}/applications`} className="text-sm text-brand">{t(locale, 'applications')} →</Link>
      </div>
      <form action={updateJobAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="hidden" name="id" value={j.id} /><input type="hidden" name="locale" value={locale} />
        <input name="title" defaultValue={j.title} className={inp} />
        <input name="role_category" defaultValue={j.role_category || ''} className={inp} />
        <select name="employment_type" defaultValue={j.employment_type || ''} className={inp}>{TYPES.map((ty) => <option key={ty} value={ty}>{t(locale, ty)}</option>)}</select>
        <textarea name="description" defaultValue={j.description || ''} rows={4} className={inp} />
        <textarea name="requirements" defaultValue={j.requirements || ''} rows={3} className={inp} />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Save</button>
      </form>
    </div>
  );
}
