// Hospital affiliated doctors — list, add by registration number, remove.

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentHospitalId } from '@/lib/hospital';
import { affiliatedDoctors } from '@/lib/hospitalPortal';
import { addDoctorAction, removeDoctorAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hospital doctors · KHP Portal' };
const inp = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none';

export default async function HospitalDoctorsPage() {
  const id = await currentHospitalId();
  const doctors = id ? await affiliatedDoctors(id) : [];

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500"><Link href="/hospital" className="hover:text-brand">Hospital</Link> › Doctors</nav>
      <h2 className="text-lg font-bold text-gray-900">Affiliated doctors</h2>

      <form action={addDoctorAction} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <input name="registration_number" required placeholder="Doctor registration number" className={`${inp} flex-1`} />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Add doctor</button>
      </form>

      {doctors.length === 0 ? <EmptyState message="No affiliated doctors yet. Add one by registration number." /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Doctor</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Specialty</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Reg. no</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-3 py-2"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map((d) => (
                <tr key={d.affiliation_id}>
                  <td className="px-3 py-2 font-medium text-gray-900">{d.display_name}</td>
                  <td className="px-3 py-2 text-gray-600">{d.specialty_en || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{d.nmc_registration_no}</td>
                  <td className="px-3 py-2">{d.verification_status}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={removeDoctorAction}>
                      <input type="hidden" name="affiliation_id" value={d.affiliation_id} />
                      <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
