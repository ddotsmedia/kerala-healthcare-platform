// Video consultation room — pre-call checklist + embedded Jitsi call.
import { notFound, redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { getConsultAppointment } from '@/lib/consult';
import { fmtDate, fmtTime } from '@/lib/format';
import VideoCall from '@/components/consult/VideoCall';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'വീഡിയോ കൺസൾട്ടേഷൻ | MalayaliDoctor' : 'Video Consultation | MalayaliDoctor', robots: { index: false } };
}

export default async function ConsultPage(props) {
  const { locale: raw, roomId } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  if (!(await getSession())) redirect(`/${locale}/login?returnUrl=/${locale}/consult/${roomId}`);
  const appt = await getConsultAppointment(roomId);
  if (!appt) notFound();

  const other = appt.role === 'doctor' ? appt.patient_name : appt.provider_name;
  const checklist = [
    ml ? 'ക്യാമറ പ്രവർത്തിക്കുന്നുണ്ടോ?' : 'Camera working?',
    ml ? 'മൈക്രോഫോൺ പ്രവർത്തിക്കുന്നുണ്ടോ?' : 'Microphone working?',
    ml ? 'ശാന്തമായ ഇടം?' : 'Quiet, private space?',
    ml ? 'അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ സ്ഥിരീകരിച്ചു' : 'Appointment details confirmed'
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">🎥 {ml ? 'വീഡിയോ കൺസൾട്ടേഷൻ' : 'Video Consultation'}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>{appt.role === 'doctor' ? (ml ? 'രോഗി' : 'Patient') : (ml ? 'ഡോക്ടർ' : 'Doctor')}: <b>{other}</b></span>
          <span>📅 {fmtDate(appt.slot_date)} · {fmtTime(appt.slot_start)}</span>
          <span>{ml ? 'റഫ്' : 'Ref'}: {appt.booking_ref}</span>
        </div>
      </header>

      {/* Pre-consultation checklist */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'കോളിന് മുമ്പ്' : 'Before you join'}</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          {checklist.map((c, i) => <li key={i} className="flex items-center gap-2">✅ {c}</li>)}
        </ul>
      </section>

      {/* Video call */}
      <VideoCall appointmentId={appt.id} roomName={appt.roomName} displayName={appt.displayName}
        jitsiUrl={appt.jitsiUrl} role={appt.role} providerSlug={appt.provider_slug} locale={locale} />

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'അടിയന്തര ലക്ഷണങ്ങളുണ്ടെങ്കിൽ വീഡിയോ കോളിനെ ആശ്രയിക്കരുത് — 112 / ആംബുലൻസ് 108 വിളിക്കുക.' : 'For emergency symptoms do not rely on a video call — call 112 / Ambulance 108.'}
      </div>
    </main>
  );
}
