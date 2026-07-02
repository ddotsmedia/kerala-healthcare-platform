// Candidate saved jobs.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { listSavedJobs } from '@/lib/candidate';
import { EmptyState } from '@khp/ui';
import { unsaveJobAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function SavedJobs({ params }) {
  const locale = resolveLocale(params.locale);
  if (!getSession()) redirect(`/${locale}/login`);
  const saved = await listSavedJobs();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'saved_jobs')}</h1>
      {saved.length === 0 ? <EmptyState message="No saved jobs." /> : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {saved.map((j) => (
            <li key={j.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <Link href={`/${locale}/jobs/${j.slug}`} className="font-medium hover:text-brand">{j.title}</Link>
                <p className="text-xs text-gray-500">{j.org_name} · {j.status}</p>
              </div>
              <form action={unsaveJobAction}>
                <input type="hidden" name="job_id" value={j.id} /><input type="hidden" name="locale" value={locale} />
                <button className="text-xs text-gray-500 hover:underline">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
