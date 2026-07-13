// Patient dashboard — upcoming + past appointments, quick book CTA.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { currentPatientId, listMyAppointments } from '@/lib/appointments';
import { fmtDate, fmtTime, today } from '@/lib/format';
import { EmptyState } from '@khp/ui';
import AppointmentWhatsApp from '@/components/appointments/AppointmentWhatsApp';

export const dynamic = 'force-dynamic';
export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'my_appointments')} · ${t(locale, 'site')}` };
}

function Row({ locale, a, whatsapp = false }) {
  const ml = locale === 'ml';
  // "Join" active from 15 min before the slot until 2h after.
  let canJoin = false;
  if (a.consultation_mode === 'video' && a.consultation_room && a.status === 'confirmed') {
    const start = new Date(`${String(a.slot_date).slice(0, 10)}T${String(a.slot_start).slice(0, 5)}:00`).getTime();
    const mins = (start - Date.now()) / 60000;
    canJoin = mins <= 15 && mins >= -120;
  }
  const isVideo = a.consultation_mode === 'video' && a.consultation_room && a.status === 'confirmed';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <Link href={`/${locale}/patient/appointments/${a.id}`} className="flex items-center justify-between hover:opacity-80">
        <div>
          <p className="font-medium">{a.provider_name}</p>
          <p className="text-xs text-gray-500">{fmtDate(a.slot_date)} · {fmtTime(a.slot_start)} · {a.consultation_mode}</p>
        </div>
        <span className="text-xs text-gray-400">{a.status}</span>
      </Link>
      {isVideo && (
        canJoin
          ? <Link href={`/${locale}/consult/${a.consultation_room}`} className="mt-2 inline-block rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">🎥 {ml ? 'വീഡിയോ കോളിൽ ചേരുക' : 'Join Video Call'}</Link>
          : <span className="mt-2 inline-block rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400" title={ml ? 'അപ്പോയിന്റ്മെന്റിന് 15 മിനിറ്റ് മുമ്പ് ലഭ്യമാകും' : 'Available 15 min before the appointment'}>🎥 {ml ? 'വീഡിയോ കോൾ' : 'Video Call'}</span>
      )}
      {whatsapp && <AppointmentWhatsApp appointment={a} locale={locale} />}
    </div>
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href={`/${locale}/patient/health-records`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">📋 {locale === 'ml' ? 'ആരോഗ്യ രേഖകൾ' : 'Health Records'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/health-tracker`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">📈 {locale === 'ml' ? 'ഹെൽത്ത് ട്രാക്കർ' : 'Health Tracker'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/prescriptions`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">💊 {locale === 'ml' ? 'പ്രിസ്ക്രിപ്ഷനുകൾ' : 'Prescriptions'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/lab-reports`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">🧪 {locale === 'ml' ? 'ലാബ് റിപ്പോർട്ടുകൾ' : 'Lab Reports'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/family`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">👨‍👩‍👧 {locale === 'ml' ? 'കുടുംബം' : 'Family'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/second-opinion`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">🩺 {locale === 'ml' ? 'രണ്ടാം അഭിപ്രായം' : 'Second Opinion'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/refill`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">🔁 {locale === 'ml' ? 'റീഫിൽ' : 'Refill'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/goals`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">🎯 {locale === 'ml' ? 'ആരോഗ്യ ലക്ഷ്യങ്ങൾ' : 'Health Goals'}</span>
          <span className="text-brand">→</span>
        </Link>
        <Link href={`/${locale}/patient/reminders`}
          className="flex items-center justify-between rounded-xl border border-brand bg-teal-50 p-4 hover:bg-teal-100">
          <span className="font-semibold text-brand">⏰ {locale === 'ml' ? 'മരുന്ന് ഓർമ്മപ്പെടുത്തൽ' : 'Med Reminders'}</span>
          <span className="text-brand">→</span>
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'upcoming')}</h2>
        {upcoming.length === 0 ? <EmptyState message={t(locale, 'no_results')} />
          : <div className="grid gap-3">{upcoming.map((a) => <Row key={a.id} locale={locale} a={a} whatsapp />)}</div>}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'past')}</h2>
        {past.length === 0 ? <EmptyState message={t(locale, 'no_results')} />
          : <div className="grid gap-3">{past.map((a) => <Row key={a.id} locale={locale} a={a} />)}</div>}
      </section>
    </div>
  );
}
