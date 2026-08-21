// Admin analytics dashboard — platform KPIs + growth analytics (P-G1).

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getMetrics } from '@/lib/analytics';
import { getOverview, getTopPages, getConversionFunnel, getRegistrationTrend, getTrafficSources, getTopSearchQueries } from '@/lib/platformAnalytics';
import { FunnelChart, LineChart, TrafficDonut } from './Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics · KHP Admin' };

function Card({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-2xl font-bold text-brand">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function TrioCard({ label, t }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div><p className="text-lg font-bold text-brand">{t.today}</p><p className="text-[10px] text-gray-400">today</p></div>
        <div><p className="text-lg font-bold text-gray-800">{t.week}</p><p className="text-[10px] text-gray-400">7d</p></div>
        <div><p className="text-lg font-bold text-gray-800">{t.month}</p><p className="text-[10px] text-gray-400">30d</p></div>
      </div>
    </div>
  );
}

export default async function Analytics() {
  if (!(await requireAdminRole())) redirect('/login');
  const [m, overview, topPages, funnel, regTrend, sources, queries] = await Promise.all([
    getMetrics(), getOverview(), getTopPages(30, 15), getConversionFunnel(30),
    getRegistrationTrend(30), getTrafficSources(30), getTopSearchQueries(7, 10)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Platform analytics</h2>
        <div className="flex gap-4">
          <a href="/analytics/providers" className="text-sm font-semibold text-brand hover:underline">Providers →</a>
          <a href="/analytics/content" className="text-sm font-semibold text-brand hover:underline">Content →</a>
          <a href="/analytics/revenue" className="text-sm font-semibold text-brand hover:underline">Revenue →</a>
          <a href="/analytics/ai" className="text-sm font-semibold text-brand hover:underline">AI →</a>
          <a href="/analytics/search" className="text-sm font-semibold text-brand hover:underline">Search analytics →</a>
        </div>
      </div>

      {/* Section 1 — Overview */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Overview (today · 7d · 30d)</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TrioCard label="Active users" t={overview.activeUsers} />
          <TrioCard label="Page views" t={overview.pageViews} />
          <TrioCard label="New registrations" t={overview.registrations} />
          <TrioCard label="Bookings completed" t={overview.bookings} />
        </div>
      </section>

      {/* legacy KPI blocks */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Users · Appointments</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <Card label="Users total" value={m.users_total} />
          <Card label="New this week" value={m.users_week} />
          <Card label="Appts confirmed" value={m.appts_confirmed} />
          <Card label="Appts today" value={m.appts_today} />
          <Card label="Cancel rate" value={`${m.cancellation_rate}%`} />
          <Card label="AI chats today" value={m.ai_today} />
        </div>
      </section>

      {/* Section 2 — Top pages */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Top pages (30d)</h3>
        {topPages.length === 0 ? <p className="text-sm text-gray-400">No page views yet.</p> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Path</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Views</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Visitors</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {topPages.map((p) => (
                  <tr key={p.path}><td className="max-w-xs truncate px-3 py-2 font-mono text-xs">{p.path}</td><td className="px-3 py-2 text-right font-semibold">{p.views}</td><td className="px-3 py-2 text-right text-gray-500">{p.visitors}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Section 3 — Funnel */}
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Conversion funnel (30d)</h3>
          <FunnelChart steps={funnel} />
        </section>

        {/* Section 4 — Traffic sources */}
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Traffic sources (30d)</h3>
          <TrafficDonut sources={sources} />
        </section>
      </div>

      {/* Section 5 — Registration trend */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Registration trend (30d)</h3>
        <LineChart series={regTrend} />
      </section>

      {/* Top search queries */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Top search queries (7d)</h3>
        {queries.length === 0 ? <p className="text-sm text-gray-400">No searches yet.</p> : (
          <div className="flex flex-wrap gap-2">
            {queries.map((q) => <span key={q.query} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{q.query} <span className="text-gray-400">{q.n}</span></span>)}
          </div>
        )}
      </section>
    </div>
  );
}
