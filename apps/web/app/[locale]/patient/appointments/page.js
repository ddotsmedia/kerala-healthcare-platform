// Patient appointment history with a status filter.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { currentPatientId, listMyAppointments } from '@/lib/appointments';
import { fmtDate, fmtTime } from '@/lib/format';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';
const STATUSES = ['confirmed', 'completed', 'cancelled', 'no_show'];

export default async function PatientAppointments({ params, searchParams }) {
  const locale = resolveLocale(params.locale);
  const pid = await currentPatientId();
  if (!pid) redirect(`/${locale}/login`);

  const status = (searchParams && searchParams.status) || '';
  const all = await listMyAppointments(pid);
  const list = status ? all.filter((a) => a.status === status) : all;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'my_appointments')}</h1>
      <nav className="flex flex-wrap gap-2">
        <Link href={`/${locale}/patient/appointments`} className={`rounded-full px-3 py-1 text-xs font-medium ${!status ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/${locale}/patient/appointments?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${status === s ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>{s}</Link>
        ))}
      </nav>
      {list.length === 0 ? <EmptyState message={t(locale, 'no_results')} /> : (
        <div className="grid gap-3">
          {list.map((a) => (
            <Link key={a.id} href={`/${locale}/patient/appointments/${a.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
              <div>
                <p className="font-medium">{a.provider_name}</p>
                <p className="text-xs text-gray-500">{fmtDate(a.slot_date)} · {fmtTime(a.slot_start)} · {t(locale, 'booking_ref')} {a.booking_ref}</p>
              </div>
              <span className="text-xs text-gray-400">{a.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
