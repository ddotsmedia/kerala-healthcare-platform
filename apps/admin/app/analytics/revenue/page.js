// Admin revenue analytics — manually-recorded revenue (payment integration deferred).

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getRevenueSummary, getMonthlyTrend, listRecent, REVENUE_TYPES } from '@/lib/revenueAnalytics';
import { addRevenueAction, deleteRevenueAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Revenue · KHP Admin' };

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';

export default async function RevenueAnalytics() {
  if (!(await requireAdminRole())) redirect('/login');
  const [summary, trend, recent] = await Promise.all([getRevenueSummary(), getMonthlyTrend(12), listRecent(20)]);
  const maxM = Math.max(1, ...trend.map((t) => t.amount));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Revenue</h2>
        <a href="/analytics" className="text-sm font-semibold text-brand hover:underline">← Analytics</a>
      </div>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Payment integration deferred — this tracks manually-recorded revenue.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{inr(summary.monthTotal)}</p><p className="text-xs text-gray-500">This month</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-gray-800">{inr(summary.allTime)}</p><p className="text-xs text-gray-500">All time</p></div>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">This month by type</h3>
        {summary.byType.length === 0 ? <p className="text-sm text-gray-400">No revenue recorded this month.</p> : (
          <div className="space-y-2">
            {summary.byType.map((r) => (
              <div key={r.type} className="flex items-center gap-2">
                <span className="w-40 shrink-0 text-sm text-gray-700">{r.type.replace(/_/g, ' ')}</span>
                <div className="h-4 flex-1 rounded bg-gray-100"><div className="h-4 rounded bg-brand" style={{ width: `${Math.round((r.amount / Math.max(1, summary.monthTotal)) * 100)}%` }} /></div>
                <span className="w-24 text-right text-xs font-semibold text-gray-600">{inr(r.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Monthly revenue trend (12 mo)</h3>
        <div className="flex items-end gap-1" style={{ height: 96 }}>
          {trend.map((t) => (
            <div key={t.month} className="flex flex-1 flex-col items-center justify-end" title={`${t.month}: ${inr(t.amount)}`}>
              <div className="w-full rounded-t bg-brand" style={{ height: `${Math.round((t.amount / maxM) * 84)}px` }} />
              <span className="mt-1 text-[9px] text-gray-400">{t.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Record revenue</h3>
        <form action={addRevenueAction} className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <select name="type" className={inp}>{REVENUE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select>
          <input name="amount_inr" type="number" min="1" required placeholder="Amount (₹)" className={inp} />
          <input name="entity_type" placeholder="Entity type (optional)" className={inp} />
          <input name="notes" placeholder="Notes (optional)" className={inp} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Record revenue</button>
        </form>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Recent</h3>
        {recent.length === 0 ? <p className="text-sm text-gray-400">No revenue recorded.</p> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Notes</th>
                <th className="px-3 py-2" />
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 text-gray-500">{fmtDate(r.created_at)}</td>
                    <td className="px-3 py-2">{r.type.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 text-right font-semibold">{inr(r.amount_inr)}</td>
                    <td className="px-3 py-2 text-gray-500">{r.notes || '—'}</td>
                    <td className="px-3 py-2 text-right"><form action={deleteRevenueAction}><input type="hidden" name="id" value={r.id} /><button className="text-gray-400 hover:text-red-500" aria-label="Delete">✕</button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
