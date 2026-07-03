// Patient dashboard — upcoming + past appointments, quick book CTA.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { currentPatientId, listMyAppointments } from '@/lib/appointments';
import { fmtDate, fmtTime, today } from '@/lib/format';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';
export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'my_appointments')} · ${t(locale, 'site')}` };
}

function Row({ locale, a }) {
  return (
    <Link href={`/${locale}/patient/appointments/${a.id}`}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
      <div>
        <p className="font-medium">{a.provider_name}</p>
        <p className="text-xs text-gray-500">{fmtDate(a.slot_date)} · {fmtTime(a.slot_start)} · {a.consultation_mode}</p>
      </div>
      <span className="text-xs text-gray-400">{a.status}</span>
    </Link>
  );
}

export default async function PatientDashboard(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const pid = await currentPatientId();
  if (!pid) redirect(`/${locale}/login`);

  const all = await listMyAppointments(pid);
  const td = today();
  const upcoming = all.filter((a) => a.status === 'confirmed' && fmtDate(a.slot_date) >= td);
  const past = all.filter((a) => !(a.status === 'confirmed' && fmtDate(a.slot_date) >= td));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t(locale, 'my_appointments')}</h1>
        <Link href={`/${locale}/doctors`} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          {t(locale, 'book_now')}
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'upcoming')}</h2>
        {upcoming.length === 0 ? <EmptyState message={t(locale, 'no_results')} />
          : <div className="grid gap-3">{upcoming.map((a) => <Row key={a.id} locale={locale} a={a} />)}</div>}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'past')}</h2>
        {past.length === 0 ? <EmptyState message={t(locale, 'no_results')} />
          : <div className="grid gap-3">{past.map((a) => <Row key={a.id} locale={locale} a={a} />)}</div>}
      </section>
    </div>
  );
}
