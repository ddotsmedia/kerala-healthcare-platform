// Patient detail — appointment timeline, clinical notes, follow-up reminder,
// and the patient's shared health records. Doctor-scoped.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { getPatient } from '@/lib/patients';
import { addNoteAction, createFollowUpAction } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Patient · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '—');
const fmtTime = (t) => String(t || '').slice(0, 5);
const NOTE_TYPES = ['clinical', 'follow_up', 'lab_instruction', 'alert'];

export default async function PatientDetailPage(props) {
  const params = await props.params;
  const id = await currentDoctorId();
  const data = id ? await getPatient(id, params.patientId) : null;
  if (!data) notFound();
  const { profile, timeline, notes, sharedRecords, followUps } = data;

  return (
    <div className="space-y-6">
      <nav className="text-xs text-gray-500"><Link href="/patients" className="hover:text-brand">Patients</Link> › {profile.full_name || 'Patient'}</nav>
      <h2 className="text-lg font-bold text-gray-900">{profile.full_name || 'Patient'}</h2>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Appointment history</h3>
        {timeline.length === 0 ? <EmptyState message="No appointments." /> : (
          <ol className="space-y-2">
            {timeline.map((a) => (
              <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{fmtDate(a.slot_date)} · {fmtTime(a.slot_start)}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{a.status}</span>
                </div>
                <p className="text-xs text-gray-500">{a.consultation_mode} · {a.booking_ref}</p>
                {a.notes_for_doctor ? <p className="mt-1 text-gray-600">“{a.notes_for_doctor}”</p> : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Add clinical note</h3>
        <form action={addNoteAction} className="space-y-2">
          <input type="hidden" name="patientId" value={profile.id} />
          <textarea name="note" required rows={3} placeholder="Note (private to you)…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <select name="noteType" className="rounded-lg border border-gray-300 px-2 py-2 text-sm">
              {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Add note</button>
          </div>
        </form>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Notes ({notes.length})</h3>
        {notes.length === 0 ? <EmptyState message="No notes yet." /> : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{n.note_type}</span>
                  <span className="text-xs text-gray-400">{fmtDate(n.created_at)}</span>
                </div>
                <p className="mt-1 text-gray-700">{n.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Set follow-up reminder</h3>
        <form action={createFollowUpAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="patientId" value={profile.id} />
          <input type="date" name="dueDate" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input name="reason" placeholder="Reason (optional)" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Set reminder</button>
        </form>
        {followUps.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm">
            {followUps.map((f) => (
              <li key={f.id} className="flex items-center justify-between text-gray-600">
                <span>{fmtDate(f.due_date)} — {f.reason || 'Follow-up'}</span>
                <span className="text-xs text-gray-400">{f.status}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Shared health records</h3>
        {sharedRecords.length === 0 ? <EmptyState message="Patient has not shared any records." /> : (
          <ul className="space-y-2">
            {sharedRecords.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <p className="font-medium text-gray-800">{r.title}</p>
                <p className="text-xs text-gray-500">{r.record_type} · {fmtDate(r.record_date)}{r.hospital_name ? ` · ${r.hospital_name}` : ''}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
