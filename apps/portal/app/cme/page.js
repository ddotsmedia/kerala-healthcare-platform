// CME tracker — annual credit total, progress toward requirement, breakdown by
// category, earned-credit list, external-CME entry, printable summary.

import { EmptyState } from '@khp/ui';
import { currentDoctorId, getMyProfile } from '@/lib/profile';
import { listCredits, yearSummary, ANNUAL_REQUIREMENT, CME_CATEGORIES } from '@/lib/cme';
import { addCreditAction, deleteCreditAction } from './actions';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'CME credits · KHP Portal' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const inputCls = 'rounded-lg border border-gray-300 px-3 py-2 text-sm';
const YEAR = 2026;

export default async function CmePage() {
  const id = await currentDoctorId();
  if (!id) return <EmptyState message="Sign in as a doctor to track CME credits." />;
  const [credits, summary, profile] = await Promise.all([listCredits(id), yearSummary(id, YEAR), getMyProfile(id)]);
  const pct = Math.min(100, Math.round((summary.total / ANNUAL_REQUIREMENT) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">CME credits · {summary.year}</h2>
        <PrintButton />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500">Credits this year</p>
            <p className="text-3xl font-extrabold text-brand">{summary.total}<span className="text-base font-medium text-gray-400"> / {ANNUAL_REQUIREMENT}</span></p>
          </div>
          <p className="text-xs text-gray-500">{summary.verified} verified · {profile?.display_name || 'Doctor'}</p>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-gray-100"><div className="h-3 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
        <p className="mt-2 text-[11px] text-gray-400">Indicative only. The NMC/State Medical Council guidance is around {ANNUAL_REQUIREMENT} credit hours/year; confirm the current requirement with your council — this is not official certification.</p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Credits by category</h3>
        {summary.byCategory.length === 0 ? <EmptyState message="No credits recorded this year." /> : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {summary.byCategory.map((c) => (
              <div key={c.category} className="rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-xs capitalize text-gray-500">{c.category}</p>
                <p className="text-xl font-bold text-gray-900">{c.credits}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Earned credits</h3>
        {credits.length === 0 ? <EmptyState message="No CME credits yet." /> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Title</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Category</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Credits</th>
                <th className="no-print px-3 py-2" />
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {credits.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-medium">{c.title}{c.organiser ? <span className="block text-xs text-gray-400">{c.organiser}</span> : null}</td>
                    <td className="px-3 py-2">{fmtDate(c.date)}</td>
                    <td className="px-3 py-2 capitalize">{c.category}{c.is_verified ? ' ✓' : ''}</td>
                    <td className="px-3 py-2 text-right font-semibold">{c.credits}</td>
                    <td className="no-print px-3 py-2 text-right">
                      <form action={deleteCreditAction}><input type="hidden" name="id" value={c.id} /><button className="text-gray-400 hover:text-red-500" aria-label="Delete">✕</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="no-print">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Add external CME</h3>
        <form action={addCreditAction} className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <input name="title" required placeholder="Activity title" className={`${inputCls} sm:col-span-2`} />
          <input name="organiser" placeholder="Organiser" className={inputCls} />
          <input name="date" type="date" required className={inputCls} />
          <input name="credits" type="number" step="0.5" min="0" required placeholder="Credits" className={inputCls} />
          <select name="category" className={inputCls}>{CME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <input name="certificateUrl" placeholder="Certificate URL (optional)" className={`${inputCls} sm:col-span-2`} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Add CME credit</button>
        </form>
      </section>
    </div>
  );
}
