// My Job Alerts — list, toggle, edit frequency, test, delete.
import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { listMyAlerts } from '@/lib/jobs';
import AlertsManager from '@/components/jobs/AlertsManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return { title: `${ml ? 'ജോലി അലേർട്ടുകൾ' : 'Job Alerts'} · ${t(locale, 'site')}` };
}

export default async function JobAlertsPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const alerts = await listMyAlerts();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{ml ? '🔔 ജോലി അലേർട്ടുകൾ' : '🔔 Job Alerts'}</h1>
        <Link href={`/${locale}/jobs`} className="text-sm font-medium text-brand">{ml ? 'ജോലികൾ' : 'Browse jobs'}</Link>
      </div>

      {alerts === null ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">{ml ? 'അലേർട്ടുകൾ കാണാൻ ലോഗിൻ ചെയ്യുക.' : 'Log in to view your job alerts.'}</p>
          <Link href={`/${locale}/login`} className="mt-3 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">
            {ml ? 'ലോഗിൻ' : 'Log in'}
          </Link>
        </div>
      ) : (
        <AlertsManager alerts={alerts} locale={locale} />
      )}
    </main>
  );
}
