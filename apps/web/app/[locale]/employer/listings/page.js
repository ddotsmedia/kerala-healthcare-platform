// Employer's own listings — close/reopen + link to applications.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { listMyJobs } from '@/lib/employer';
import { EmptyState } from '@khp/ui';
import { closeJobAction, reopenJobAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EmployerListings(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const jobs = await listMyJobs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Listings</h1>
        <Link href={`/${locale}/employer/listings/new`} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white">{t(locale, 'post_job')}</Link>
      </div>
      {jobs.length === 0 ? <EmptyState message="No listings yet." /> : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <Link href={`/${locale}/employer/listings/${j.id}`} className="font-medium hover:text-brand">{j.title}</Link>
                <span className="ml-2 text-xs text-gray-400">{j.status} · {j.application_count} apps</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/employer/listings/${j.id}/applications`} className="text-xs text-brand">{t(locale, 'applications')}</Link>
                <form action={j.status === 'active' ? closeJobAction : reopenJobAction}>
                  <input type="hidden" name="id" value={j.id} /><input type="hidden" name="locale" value={locale} />
                  <button className="text-xs text-gray-500 hover:underline">{j.status === 'active' ? 'Close' : 'Reopen'}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
