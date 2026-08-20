// Interpret Lab Results — doctor adds context to a patient's lab report.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { getAppointmentPatientReports } from '@/lib/labInterpret';
import { addInterpretationAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Interpret lab results · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default async function InterpretPage(props) {
  const params = await props.params;
  const sp = (await props.searchParams) || {};
  const providerId = await currentDoctorId();
  const data = providerId ? await getAppointmentPatientReports(providerId, params.id) : null;
  if (!data) notFound();
  const { appt, reports } = data;

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500"><Link href="/schedule" className="hover:text-brand">Schedule</Link> › Interpret lab results</nav>
      <h2 className="text-lg font-bold text-gray-900">Interpret lab results</h2>

      {sp.saved ? <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">✓ Interpretation saved and shared with the patient.</div> : null}
      {sp.error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Could not save: {sp.error}</div> : null}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
        <p className="font-semibold text-gray-800">{appt.patient_name || 'Patient'}</p>
        <p className="text-xs text-gray-500">{fmtDate(appt.slot_date)} · {appt.consultation_mode} · {appt.status}</p>
      </div>

      <form action={addInterpretationAction} className="space-y-4">
        <input type="hidden" name="appointmentId" value={appt.id} />

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Lab report</label>
          {reports.length === 0 ? (
            <EmptyState message="This patient has no lab reports on file. You can still record a general interpretation." />
          ) : (
            <select name="labReportId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">— General (not linked to a report) —</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>{(r.lab_name || 'Lab report')} · {r.report_type || ''} · {fmtDate(r.report_date)}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Interpretation</label>
          <textarea name="interpretation" required rows={4} placeholder="What the results mean in plain language…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Recommendations</label>
          <textarea name="recommendations" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Next test date</label>
            <input type="date" name="nextTestDate" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Urgency</label>
            <select name="urgency" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="routine">Routine</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isShared" value="true" defaultChecked /> Share with patient
        </label>

        <button className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-white">Save interpretation</button>
      </form>
    </div>
  );
}
