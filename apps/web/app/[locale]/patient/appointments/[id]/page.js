// Patient appointment detail — info + cancel CTA (reschedule is doctor-managed).

import { notFound, redirect } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { currentPatientId, getMyAppointment } from '@/lib/appointments';
import { fmtDate, fmtTime } from '@/lib/format';
import { ProfileField } from '@khp/ui';
import { cancelAppointmentAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AppointmentDetail({ params }) {
  const locale = resolveLocale(params.locale);
  const pid = await currentPatientId();
  if (!pid) redirect(`/${locale}/login`);
  const a = await getMyAppointment(pid, params.id);
  if (!a) notFound();

  const roomUrl = a.consultation_room ? `/consult/${a.consultation_room}` : null;
  const canCancel = a.status === 'confirmed';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{a.provider_name}</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ProfileField label={t(locale, 'status')} value={a.status} />
        <ProfileField label="Date" value={`${fmtDate(a.slot_date)} ${fmtTime(a.slot_start)}–${fmtTime(a.slot_end)}`} />
        <ProfileField label="Mode" value={a.consultation_mode} />
        <ProfileField label={t(locale, 'booking_ref')} value={a.booking_ref} />
        {roomUrl && (
          <ProfileField label={t(locale, 'consultation_room')}>
            <a href={roomUrl} className="text-brand underline">{a.consultation_room}</a>
          </ProfileField>
        )}
      </div>

      {canCancel ? (
        <form action={cancelAppointmentAction} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <input type="hidden" name="id" value={a.id} />
          <input name="reason" placeholder="Reason (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            {t(locale, 'cancel')}
          </button>
          <p className="text-xs text-gray-400">{t(locale, 'reschedule_note')}</p>
        </form>
      ) : (
        <p className="text-xs text-gray-400">{t(locale, 'reschedule_note')}</p>
      )}
    </div>
  );
}
