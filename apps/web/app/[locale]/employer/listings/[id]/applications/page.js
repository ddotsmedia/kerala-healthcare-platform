// Application pipeline for one listing. Status inline; contact revealed at shortlist+.

import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { listApplicationsForJob } from '@/lib/applications';
import { EmptyState } from '@khp/ui';
import { setAppStatusAction } from '../../../actions';

export const dynamic = 'force-dynamic';
const NEXT = ['shortlisted', 'interview', 'offered', 'rejected'];

export default async function JobApplications({ params }) {
  const locale = resolveLocale(params.locale);
  if (!getSession()) redirect(`/${locale}/login`);
  const r = await listApplicationsForJob(params.id);
  if (!r.ok) redirect(`/${locale}/employer/listings`);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'applications')}</h1>
      {r.applications.length === 0 ? <EmptyState message="No applications." /> : (
        <ul className="space-y-3">
          {r.applications.map((a) => (
            <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{a.headline || a.role_category}</p>
                  <p className="text-xs text-gray-500">{a.role_category} · {a.experience_years} {t(locale, 'years')} · {a.status}</p>
                  {a.contact_visible ? (
                    <p className="mt-1 text-xs text-emerald-700">Contact unlocked: {a.resume_url || '—'} {a.linkedin_url || ''}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">Contact hidden until shortlisted</p>
                  )}
                  {a.cover_letter && <p className="mt-1 text-sm text-gray-700">{a.cover_letter}</p>}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {NEXT.map((st) => (
                  <form key={st} action={setAppStatusAction}>
                    <input type="hidden" name="app_id" value={a.id} />
                    <input type="hidden" name="job_id" value={params.id} />
                    <input type="hidden" name="status" value={st} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50">{st}</button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
