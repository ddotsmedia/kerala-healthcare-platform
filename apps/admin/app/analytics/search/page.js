// Admin search analytics — top queries, zero-result queries, filter usage.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getTopQueries, getZeroResultQueries, getFilterUsage, getQueryToClickRate, getHealthTrends } from '@/lib/searchAnalytics';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Search analytics · KHP Admin' };

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default async function SearchAnalytics() {
  if (!(await requireAdminRole())) redirect('/login');
  const [top, zero, filters, ctr, trends] = await Promise.all([
    getTopQueries(7, 20), getZeroResultQueries(7, 30), getFilterUsage(30), getQueryToClickRate(30), getHealthTrends(7)
  ]);
  const fTotal = Math.max(1, filters.total);

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Search analytics</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{filters.total}</p><p className="text-xs text-gray-500">Searches (30d)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{zero.length}</p><p className="text-xs text-gray-500">Zero-result queries (7d)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{filters.any_filter}</p><p className="text-xs text-gray-500">Used a filter (30d)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{ctr.rate}%</p><p className="text-xs text-gray-500">Query→click rate</p></div>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Top queries (7d)</h3>
        {top.length === 0 ? <p className="text-sm text-gray-400">No searches yet.</p> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Query</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Searches</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Avg results</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {top.map((q) => (
                  <tr key={q.query}><td className="px-3 py-2">{q.query}</td><td className="px-3 py-2 text-right font-semibold">{q.searches}</td><td className="px-3 py-2 text-right text-gray-500">{q.avg_results}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-red-500">Zero-result queries — action items (7d)</h3>
        {zero.length === 0 ? <p className="text-sm text-gray-400">No zero-result queries. 🎉</p> : (
          <div className="overflow-x-auto rounded-xl border border-red-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-red-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Query with no doctors</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Times searched</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Last seen</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {zero.map((q) => (
                  <tr key={q.query}><td className="px-3 py-2 font-medium text-red-700">{q.query}</td><td className="px-3 py-2 text-right font-semibold">{q.searches}</td><td className="px-3 py-2 text-right text-gray-500">{fmtDate(q.last_seen)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-400">These queries returned no doctors — consider onboarding the missing specialty or providers.</p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-gray-500">Health trends — district search activity (7d)</h3>
          <a href="/ml/health-trends" className="text-xs font-semibold text-brand hover:underline">Public trends page →</a>
        </div>
        {trends.districts.length === 0 ? <p className="text-sm text-gray-400">No district-tagged searches yet.</p> : (
          <div className="flex flex-wrap gap-2">
            {trends.districts.map((d) => <span key={d.district} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-700">{d.district} <span className="font-semibold">{d.searches}</span></span>)}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Filter usage (30d)</h3>
        <div className="space-y-2">
          {[['Specialty', filters.specialty], ['District', filters.district], ['Mode', filters.mode], ['Language', filters.language]].map(([label, n]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-sm text-gray-700">{label}</span>
              <div className="h-4 flex-1 rounded bg-gray-100"><div className="h-4 rounded bg-brand" style={{ width: `${Math.round((n / fTotal) * 100)}%` }} /></div>
              <span className="w-10 text-right text-xs font-semibold text-gray-600">{n}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
