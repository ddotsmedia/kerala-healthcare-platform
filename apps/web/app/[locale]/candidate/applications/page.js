// Candidate application history with status + withdraw.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { listMyApplications } from '@/lib/applications';
import { EmptyState } from '@khp/ui';
import { withdrawAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CandidateApplications(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const apps = await listMyApplications();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'my_applications')}</h1>
      {apps.length === 0 ? <EmptyState message="No applications yet." /> : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {apps.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <Link href={`/${locale}/jobs/${a.job_slug}`} className="font-medium hover:text-brand">{a.title}</Link>
                <p className="text-xs text-gray-500">{a.org_name} · {a.status}</p>
              </div>
              {!['withdrawn', 'rejected'].includes(a.status) && (
                <form action={withdrawAction}>
                  <input type="hidden" name="app_id" value={a.id} /><input type="hidden" name="locale" value={locale} />
                  <button className="text-xs text-red-600 hover:underline">Withdraw</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
