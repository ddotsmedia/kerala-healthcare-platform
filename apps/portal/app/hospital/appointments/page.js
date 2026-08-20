// Today's appointments at this hospital + CSV export link.

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentHospitalId } from '@/lib/hospital';
import { todaysAppointments } from '@/lib/hospitalPortal';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hospital appointments · KHP Portal' };

const fmtTime = (t) => String(t || '').slice(0, 5);

export default async function HospitalAppointmentsPage() {
  const id = await currentHospitalId();
  const appts = id ? await todaysAppointments(id) : [];

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500"><Link href="/hospital" className="hover:text-brand">Hospital</Link> › Appointments</nav>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{"Today's appointments"}</h2>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/portal/hospital/appointments?format=csv" className="text-sm font-semibold text-brand hover:underline">⬇ Export CSV</a>
      </div>

      {appts.length === 0 ? <EmptyState message="No appointments today." /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Time</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Doctor</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Patient</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Mode</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {appts.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 font-medium">{fmtTime(a.slot_start)}</td>
                  <td className="px-3 py-2">{a.doctor_name}</td>
                  <td className="px-3 py-2">{a.patient_name || '—'}</td>
                  <td className="px-3 py-2">{a.consultation_mode}</td>
                  <td className="px-3 py-2">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
