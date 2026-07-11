// Second-opinion queue. Server component. Match open requests to specialists.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { listRequestsByStatus, statusCounts, suggestDoctors } from '@/lib/secondOpinion';
import { matchAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Second opinion · KHP Admin' };

const TABS = ['open', 'matched', 'completed', 'cancelled'];
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

async function RequestCard({ r }) {
  const suggestions = r.status === 'open'
    ? await suggestDoctors(r.preferred_specialty_id, r.preferred_district_id, 8)
    : [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{r.condition_description}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {r.patient_name || 'Patient'} · {r.specialty_en || 'Any specialty'}{r.district_en ? ` · ${r.district_en}` : ''} · <span className="uppercase">{r.urgency}</span> · {fmtDate(r.created_at)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${r.urgency === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{r.urgency}</span>
      </div>
      {r.existing_diagnosis && <p className="mt-1 text-xs text-gray-600"><b>Dx:</b> {r.existing_diagnosis}</p>}
      {r.existing_treatment && <p className="text-xs text-gray-600"><b>Rx:</b> {r.existing_treatment}</p>}

      {r.status === 'matched' && <p className="mt-2 text-sm text-green-700">✓ Matched with {r.matched_doctor_name}</p>}

      {r.status === 'open' && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">Suggested specialists</p>
          {suggestions.length === 0 ? (
            <p className="text-xs text-gray-400">No matching doctors — broaden specialty/district.</p>
          ) : (
            <form action={matchAction} className="space-y-2">
              <input type="hidden" name="requestId" value={r.id} />
              <select name="doctorId" required className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
                {suggestions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.display_name} — {d.specialty_en || ''}{d.district_en ? `, ${d.district_en}` : ''}{d.rating_count > 0 ? ` · ⭐${Number(d.rating_avg).toFixed(1)}` : ''}
                  </option>
                ))}
              </select>
              <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white">Match to selected</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default async function SecondOpinionQueue(props) {
  if (!(await requireAdminRole())) redirect('/login');
  const searchParams = await props.searchParams;
  const status = (searchParams && TABS.includes(searchParams.status)) ? searchParams.status : 'open';
  const [requests, counts] = await Promise.all([listRequestsByStatus(status), statusCounts()]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Second-opinion queue</h2>
      <nav className="flex flex-wrap gap-2">
        {TABS.map((s) => (
          <Link key={s} href={`/second-opinion?status=${s}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${s === status ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {s}<span className={`rounded-full px-1.5 text-[10px] ${s === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{counts[s] || 0}</span>
          </Link>
        ))}
      </nav>
      {requests.length === 0 ? <p className="text-sm text-gray-500">No {status} requests.</p> : (
        <div className="space-y-3">{requests.map((r) => <RequestCard key={r.id} r={r} />)}</div>
      )}
    </div>
  );
}
