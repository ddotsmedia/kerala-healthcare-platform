// Referrals — received (with outcome update) + sent, for the logged-in doctor.

import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { listSent, listReceived } from '@/lib/referrals';
import { updateOutcomeAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Referrals · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const urgencyTone = (u) => (u === 'urgent' ? 'bg-red-600 text-white' : u === 'soon' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700');

export default async function ReferralsPage(props) {
  const sp = (await props.searchParams) || {};
  const id = await currentDoctorId();
  const [received, sent] = id ? await Promise.all([listReceived(id), listSent(id)]) : [[], []];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Referrals</h2>
      {sp.sent ? <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">✓ Referral sent.</div> : null}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Received ({received.length})</h3>
        {received.length === 0 ? <EmptyState message="No referrals received." /> : (
          <ul className="space-y-3">
            {received.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{r.patient_name || 'Patient'}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${urgencyTone(r.urgency)}`}>{r.urgency}</span>
                </div>
                <p className="text-xs text-gray-500">From {r.referrer_name} · {fmtDate(r.created_at)} · {r.status}</p>
                <p className="mt-1 text-sm text-gray-700">{r.reason}</p>
                {r.clinical_summary ? <p className="mt-1 text-sm text-gray-500">{r.clinical_summary}</p> : null}
                <form action={updateOutcomeAction} className="mt-2 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status === 'sent' ? 'completed' : r.status} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
                    <option value="acknowledged">Acknowledged</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                  </select>
                  <input name="outcome" defaultValue={r.outcome || ''} placeholder="Outcome…" className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white">Update</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Sent ({sent.length})</h3>
        {sent.length === 0 ? <EmptyState message="No referrals sent." /> : (
          <ul className="space-y-2">
            {sent.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{r.patient_name} → {r.specialist_name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${urgencyTone(r.urgency)}`}>{r.urgency}</span>
                </div>
                <p className="text-xs text-gray-500">{fmtDate(r.created_at)} · {r.status}</p>
                <p className="mt-1 text-gray-700">{r.reason}</p>
                {r.outcome ? <p className="mt-1 text-xs text-green-700">Outcome: {r.outcome}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
