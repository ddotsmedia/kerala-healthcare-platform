// Follow-ups due this week. Mark completed / dismiss / reschedule to next week.

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { listFollowUps } from '@/lib/patients';
import { updateFollowUpAction } from '../patients/actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Follow-ups · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '—');

function ActionBtn({ id, status, label, className }) {
  return (
    <form action={updateFollowUpAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={className}>{label}</button>
    </form>
  );
}

export default async function FollowUpsPage() {
  const id = await currentDoctorId();
  const items = id ? await listFollowUps(id, 7) : [];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Follow-ups due this week</h2>

      {!id ? <EmptyState message="Sign in as a doctor to view follow-ups." /> :
        items.length === 0 ? <EmptyState message="No follow-ups due." /> : (
        <ul className="space-y-2">
          {items.map((f) => (
            <li key={f.id} className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/patients/${f.patient_id}`} className="text-sm font-semibold text-brand hover:underline">{f.full_name || 'Patient'}</Link>
                  <p className="text-xs text-gray-500">Due {fmtDate(f.due_date)} · {f.reason || 'Follow-up'}</p>
                </div>
                <div className="flex gap-2">
                  <ActionBtn id={f.id} status="completed" label="Complete" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white" />
                  <ActionBtn id={f.id} status="dismissed" label="Dismiss" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
