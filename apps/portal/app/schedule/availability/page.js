// Availability management — weekly templates + date overrides.

import { currentDoctorId } from '@/lib/profile';
import { listTemplates, listOverrides } from '@/lib/availability';
import { EmptyState } from '@khp/ui';
import {
  addTemplateAction, removeTemplateAction, addOverrideAction, removeOverrideAction
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Availability · KHP Portal' };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');

export default async function AvailabilityPage() {
  const providerId = currentDoctorId();
  if (!providerId) return <EmptyState message="No provider loaded." />;
  const [templates, overrides] = await Promise.all([listTemplates(providerId), listOverrides(providerId)]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Weekly templates</h3>
        {templates.length === 0 ? <EmptyState message="No templates." /> : (
          <ul className="mb-3 space-y-1 text-sm">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center justify-between border-b border-gray-100 py-1">
                <span>{DAYS[t.day_of_week]} {fmtTime(t.start_time)}–{fmtTime(t.end_time)} · {t.slot_duration_minutes}m · {t.consultation_mode}</span>
                <form action={removeTemplateAction}><input type="hidden" name="id" value={t.id} /><button className="text-xs text-red-600">Remove</button></form>
              </li>
            ))}
          </ul>
        )}
        <form action={addTemplateAction} className="flex flex-wrap items-end gap-2">
          <select name="day_of_week" className={inp}>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select>
          <input type="time" name="start_time" required className={inp} />
          <input type="time" name="end_time" required className={inp} />
          <input type="number" name="slot_duration_minutes" defaultValue={30} className={`${inp} w-20`} />
          <select name="consultation_mode" className={inp}><option value="in_person">in_person</option><option value="video">video</option><option value="phone">phone</option></select>
          <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Add</button>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Date overrides</h3>
        {overrides.length === 0 ? <EmptyState message="No overrides." /> : (
          <ul className="mb-3 space-y-1 text-sm">
            {overrides.map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-gray-100 py-1">
                <span>{String(o.override_date).slice(0, 10)} · {o.is_blocked ? 'BLOCKED' : `${fmtTime(o.start_time)}–${fmtTime(o.end_time)}`}{o.reason ? ` · ${o.reason}` : ''}</span>
                <form action={removeOverrideAction}><input type="hidden" name="id" value={o.id} /><button className="text-xs text-red-600">Remove</button></form>
              </li>
            ))}
          </ul>
        )}
        <form action={addOverrideAction} className="flex flex-wrap items-end gap-2">
          <input type="date" name="override_date" required className={inp} />
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="is_blocked" /> block</label>
          <input type="time" name="start_time" className={inp} />
          <input type="time" name="end_time" className={inp} />
          <input name="reason" placeholder="reason" className={inp} />
          <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Add</button>
        </form>
      </section>
    </div>
  );
}
