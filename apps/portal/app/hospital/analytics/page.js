// Hospital analytics — appointment volume by department + doctor (last 30 days).

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentHospitalId } from '@/lib/hospital';
import { hospitalAnalytics } from '@/lib/hospitalPortal';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hospital analytics · KHP Portal' };

export default async function HospitalAnalyticsPage() {
  const id = await currentHospitalId();
  const a = id ? await hospitalAnalytics(id) : { byDept: [], byDoctor: [], total30: 0 };
  const maxDept = Math.max(1, ...a.byDept.map((d) => d.n));

  return (
    <div className="space-y-6">
      <nav className="text-xs text-gray-500"><Link href="/hospital" className="hover:text-brand">Hospital</Link> › Analytics</nav>
      <h2 className="text-lg font-bold text-gray-900">Analytics — last 30 days</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Total appointments (30 days)</p>
        <p className="text-3xl font-extrabold text-brand">{a.total30}</p>
        <p className="mt-1 text-xs text-gray-400">Profile-view analytics will appear here once view tracking is enabled.</p>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Appointment volume by department</h3>
        {a.byDept.length === 0 ? <EmptyState message="No appointment data yet." /> : (
          <div className="space-y-2">
            {a.byDept.map((d) => (
              <div key={d.department} className="flex items-center gap-2">
                <span className="w-32 shrink-0 truncate text-sm text-gray-700">{d.department}</span>
                <div className="h-4 flex-1 rounded bg-gray-100"><div className="h-4 rounded bg-brand" style={{ width: `${(d.n / maxDept) * 100}%` }} /></div>
                <span className="w-8 text-right text-xs font-semibold text-gray-600">{d.n}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Doctor performance</h3>
        {a.byDoctor.length === 0 ? <EmptyState message="No doctor data yet." /> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Doctor</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Appointments</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Completed</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {a.byDoctor.map((d) => (
                  <tr key={d.doctor}><td className="px-3 py-2 font-medium">{d.doctor}</td><td className="px-3 py-2">{d.appointments}</td><td className="px-3 py-2">{d.completed}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
