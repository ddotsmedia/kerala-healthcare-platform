// Refill request queue — approve (creates prescription) / reject / dispatch.
import Link from 'next/link';
import { currentDoctorId } from '@/lib/profile';
import { listRefills, statusCounts } from '@/lib/refills';
import { EmptyState } from '@khp/ui';
import { decideAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Refills · KHP Portal' };

const TABS = ['pending', 'approved', 'rejected', 'dispatched'];
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export default async function RefillsPage(props) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return <EmptyState message="No provider loaded." />;
  const searchParams = await props.searchParams;
  const status = (searchParams && TABS.includes(searchParams.status)) ? searchParams.status : 'pending';
  const [requests, counts] = await Promise.all([listRefills(doctorId, status), statusCounts(doctorId)]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Refill requests</h2>
      <nav className="flex flex-wrap gap-2">
        {TABS.map((s) => (
          <Link key={s} href={`/refills?status=${s}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${s === status ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {s}<span className={`rounded-full px-1.5 text-[10px] ${s === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{counts[s] || 0}</span>
          </Link>
        ))}
      </nav>

      {requests.length === 0 ? <EmptyState message={`No ${status} requests.`} /> : (
        <ul className="space-y-3">
          {requests.map((r) => {
            const meds = Array.isArray(r.medications_requested) ? r.medications_requested : [];
            return (
              <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{r.patient_name || 'Patient'}</p>
                    <p className="text-xs text-gray-500 uppercase">{r.urgency} · {fmtDate(r.created_at)}</p>
                  </div>
                </div>
                <ul className="mt-2 text-sm text-gray-700">
                  {meds.map((m, i) => <li key={i}>💊 <b>{m.name}</b> {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</li>)}
                </ul>
                {r.reason && <p className="mt-1 text-xs text-gray-600">📝 {r.reason}</p>}

                {status === 'pending' ? (
                  <form action={decideAction} className="mt-3 space-y-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input name="doctor_notes" placeholder="Notes to patient (optional)" className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                    <div className="flex gap-2">
                      <button name="status" value="approved" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white">Approve → create Rx</button>
                      <button name="status" value="rejected" className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600">Reject</button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">{r.doctor_notes ? `📝 ${r.doctor_notes}` : ''}{r.new_prescription_id ? ' · Rx created' : ''}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
