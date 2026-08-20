// Doctor's patient list — everyone who has booked with them. Name search.

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { listPatients } from '@/lib/patients';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My patients · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '—');

export default async function PatientsPage(props) {
  const sp = await props.searchParams;
  const search = sp && sp.q ? String(sp.q) : '';
  const id = await currentDoctorId();
  const patients = id ? await listPatients(id, search) : [];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">My patients</h2>

      <form method="get" className="flex gap-2">
        <input name="q" defaultValue={search} placeholder="Search by name…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Search</button>
      </form>

      {!id ? <EmptyState message="Sign in as a doctor to view your patients." /> :
        patients.length === 0 ? <EmptyState message="No patients found." /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Patient</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Last visit</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Visits</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Upcoming</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Notes</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => (
                <tr key={p.patient_id}>
                  <td className="px-3 py-2 font-medium">
                    <Link href={`/patients/${p.patient_id}`} className="text-brand hover:underline">{p.full_name || 'Patient'}</Link>
                  </td>
                  <td className="px-3 py-2">{fmtDate(p.last_visit)}</td>
                  <td className="px-3 py-2">{p.total_visits}</td>
                  <td className="px-3 py-2">{p.upcoming}</td>
                  <td className="px-3 py-2">{p.note_count > 0 ? `📝 ${p.note_count}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
