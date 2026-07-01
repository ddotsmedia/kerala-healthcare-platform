// Doctor schedule — today's (or ?date=) appointments; mark complete / cancel.

import { currentDoctorId } from '@/lib/profile';
import { getSchedule } from '@/lib/schedule';
import { EmptyState } from '@khp/ui';
import { completeAction, cancelAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Today's schedule · KHP Portal" };

const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');

export default async function SchedulePage({ searchParams }) {
  const providerId = (await currentDoctorId());
  if (!providerId) return <EmptyState message="No provider loaded (PORTAL_DEMO_DOCTOR_ID)." />;
  const date = (searchParams && searchParams.date) || undefined;
  const { date: day, appointments } = await getSchedule(providerId, date);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Schedule — {day}</h2>
        <form method="get"><input type="date" name="date" defaultValue={day} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></form>
      </div>

      {appointments.length === 0 ? <EmptyState message="No appointments." /> : (
        <ul className="space-y-3">
          {appointments.map((a) => (
            <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{fmtTime(a.slot_start)}–{fmtTime(a.slot_end)} · {a.patient_name || 'Patient'}</p>
                  <p className="text-xs text-gray-500">{a.consultation_mode} · {a.booking_ref} · {a.status}</p>
                  {a.notes_for_doctor && <p className="mt-1 text-sm text-gray-700">📝 {a.notes_for_doctor}</p>}
                </div>
                {a.status === 'confirmed' && (
                  <div className="flex flex-col gap-2">
                    <form action={completeAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white">Complete</button>
                    </form>
                    <form action={cancelAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600">Cancel</button>
                    </form>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
