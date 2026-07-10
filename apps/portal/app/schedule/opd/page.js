// OPD schedule management — doctor manages their OPD slots per affiliated hospital.

import { currentDoctorId } from '@/lib/profile';
import { myAffiliatedHospitals, myOpd } from '@/lib/opd';
import { EmptyState } from '@khp/ui';
import { addOpdAction, removeOpdAction, toggleOpdAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'OPD schedules · KHP Portal' };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CTYPES = ['outpatient', 'ward_rounds', 'surgery_day'];
const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');
const hName = (o) => o.hospital_name_en || o.hospital_name_ml;

export default async function OpdPage() {
  const providerId = (await currentDoctorId());
  if (!providerId) return <EmptyState message="No provider loaded." />;
  const [hospitals, schedules] = await Promise.all([myAffiliatedHospitals(providerId), myOpd(providerId)]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">My OPD schedules</h3>
        {schedules.length === 0 ? <EmptyState message="No OPD schedules yet." /> : (
          <ul className="mb-3 space-y-1 text-sm">
            {schedules.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 py-1.5">
                <span className={o.is_active ? '' : 'text-gray-400 line-through'}>
                  <b>{hName(o)}</b> · {(o.day_of_week || []).map((i) => DAYS[i]).join(', ')} · {fmtTime(o.start_time)}–{fmtTime(o.end_time)} · {o.consultation_type}{o.max_tokens != null ? ` · ${o.max_tokens} tokens` : ''}
                </span>
                <span className="flex gap-3">
                  <form action={toggleOpdAction}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="is_active" value={o.is_active ? '0' : '1'} /><button className="text-xs text-gray-600">{o.is_active ? 'Disable' : 'Enable'}</button></form>
                  <form action={removeOpdAction}><input type="hidden" name="id" value={o.id} /><button className="text-xs text-red-600">Remove</button></form>
                </span>
              </li>
            ))}
          </ul>
        )}

        {hospitals.length === 0 ? (
          <p className="text-sm text-gray-500">Add a hospital affiliation first (Affiliations tab) to create OPD schedules.</p>
        ) : (
          <form action={addOpdAction} className="flex flex-wrap items-end gap-2">
            <select name="hospital_id" required className={inp}>
              {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name_en || h.name_ml}</option>)}
            </select>
            <span className="flex flex-wrap gap-1.5 text-xs">
              {DAYS.map((d, i) => (
                <label key={i} className="flex items-center gap-0.5"><input type="checkbox" name="dow" value={i} /> {d}</label>
              ))}
            </span>
            <input type="time" name="start_time" required className={inp} />
            <input type="time" name="end_time" required className={inp} />
            <select name="consultation_type" className={inp}>{CTYPES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <input type="number" name="max_tokens" placeholder="tokens" className={`${inp} w-24`} />
            <input name="notes_en" placeholder="notes" className={inp} />
            <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Add</button>
          </form>
        )}
      </section>
    </div>
  );
}
