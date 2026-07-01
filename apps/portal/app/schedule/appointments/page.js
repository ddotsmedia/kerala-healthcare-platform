// Doctor appointment history with a status filter.

import Link from 'next/link';
import { currentDoctorId } from '@/lib/profile';
import { listProviderAppointments } from '@/lib/schedule';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Appointments · KHP Portal' };

const STATUSES = ['confirmed', 'completed', 'cancelled', 'no_show'];
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');

export default async function PortalAppointments({ searchParams }) {
  const providerId = (await currentDoctorId());
  if (!providerId) return <EmptyState message="No provider loaded." />;
  const status = (searchParams && searchParams.status) || '';
  const list = await listProviderAppointments(providerId, status || undefined);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Appointments</h2>
      <nav className="flex flex-wrap gap-2">
        <Link href="/schedule/appointments" className={`rounded-full px-3 py-1 text-xs font-medium ${!status ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/schedule/appointments?status=${s}`} className={`rounded-full px-3 py-1 text-xs font-medium ${status === s ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>{s}</Link>
        ))}
      </nav>
      {list.length === 0 ? <EmptyState message="No appointments." /> : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {list.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{String(a.slot_date).slice(0, 10)} {fmtTime(a.slot_start)} · {a.patient_name || 'Patient'} · {a.booking_ref}</span>
              <span className="text-xs text-gray-400">{a.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
