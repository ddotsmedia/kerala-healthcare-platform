// Doctor↔patient chat (doctor view). Only for the doctor's completed appointment.
import { EmptyState } from '@khp/ui';
import { getDoctorChat } from '@/lib/chat';
import { sendAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Patient chat · KHP Portal' };

const fmt = (d) => { try { return new Date(d).toLocaleString(); } catch { return ''; } };

export default async function DoctorChatPage(props) {
  const { id } = await props.params;
  const r = await getDoctorChat(id);
  if (r.error === 'unauthenticated' || r.error === 'not_found') {
    return <EmptyState message="Chat not available for this appointment." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">💬 Chat — {r.ctx?.patient_name || 'Patient'} <span className="text-xs font-normal text-gray-400">({r.ctx?.booking_ref})</span></h2>

      <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        This chat is for follow-up questions only. For urgent concerns advise the patient to book a new appointment or call 112/108.
      </div>

      {r.error === 'locked' ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">🔒 Chat unlocks after the appointment is completed.</div>
      ) : (
        <>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
            {r.messages.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">No messages yet.</p> : r.messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender_role === 'doctor' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="whitespace-pre-wrap">{m.message}</p>
                  <p className={`mt-0.5 text-[10px] ${m.sender_role === 'doctor' ? 'text-white/70' : 'text-gray-400'}`}>{fmt(m.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          <form action={sendAction} className="flex gap-2">
            <input type="hidden" name="id" value={id} />
            <input name="message" maxLength={2000} required placeholder="Type a reply…" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Send</button>
          </form>
        </>
      )}
    </div>
  );
}
