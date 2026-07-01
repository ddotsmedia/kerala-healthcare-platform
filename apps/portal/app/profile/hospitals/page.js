// Doctor hospital-affiliation management. Add/remove affiliations.

import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { listAffiliations, listAffiliableHospitals } from '@/lib/affiliations';
import { addAffiliationAction, removeAffiliationAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hospital affiliations · KHP Portal' };

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none';

export default async function AffiliationsPage() {
  const id = (await currentDoctorId());
  const [affiliations, hospitals] = await Promise.all([
    listAffiliations(id),
    listAffiliableHospitals()
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Hospital affiliations</h2>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        {affiliations.length === 0 ? (
          <EmptyState message="No hospital affiliations yet." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {affiliations.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{a.name_en || a.name_ml}</p>
                  {a.role && <p className="text-xs text-gray-500">{a.role}</p>}
                </div>
                <form action={removeAffiliationAction}>
                  <input type="hidden" name="affiliation_id" value={a.id} />
                  <button type="submit" className="text-xs font-medium text-red-600 hover:underline">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={addAffiliationAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">Add affiliation</h3>
        <label className="block text-sm">
          <span className="text-gray-700">Hospital</span>
          <select name="hospital_id" required className={inputCls}>
            <option value="">Select a verified hospital…</option>
            {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name_en || h.name_ml}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Role</span>
          <input name="role" placeholder="e.g. Consultant, Visiting" className={inputCls} />
        </label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Add affiliation
        </button>
      </form>
    </div>
  );
}
