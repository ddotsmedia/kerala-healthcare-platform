// Write Prescription — doctor issues a digital prescription for an appointment.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentDoctorId } from '@/lib/profile';
import { getAppointment } from '@/lib/prescribe';
import PrescriptionForm from './PrescriptionForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Write prescription · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '—');
const fmtTime = (t) => String(t || '').slice(0, 5);

export default async function WritePrescriptionPage(props) {
  const params = await props.params;
  const sp = (await props.searchParams) || {};
  const providerId = await currentDoctorId();
  const appt = providerId ? await getAppointment(providerId, params.id) : null;
  if (!appt) notFound();

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500"><Link href="/schedule" className="hover:text-brand">Schedule</Link> › Prescription</nav>
      <h2 className="text-lg font-bold text-gray-900">Write prescription</h2>

      {sp.issued ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✓ Prescription issued — it is now in the patient&apos;s health records.
        </div>
      ) : null}
      {sp.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not issue prescription: {sp.error}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
        <p className="font-semibold text-gray-800">{appt.patient_name || 'Patient'}</p>
        <p className="text-xs text-gray-500">
          {fmtDate(appt.slot_date)} · {fmtTime(appt.slot_start)} · {appt.consultation_mode} · {appt.status}
        </p>
      </div>

      <PrescriptionForm appointmentId={appt.id} />
    </div>
  );
}
