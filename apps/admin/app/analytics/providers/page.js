// Admin provider performance — leaderboard, underperformers, profile-completion.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import AnalyticsTabs from '../AnalyticsTabs';
import { getTopPerformingProviders } from '@/lib/providerAnalytics';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Provider performance · KHP Admin' };

export default async function ProviderAnalytics() {
  if (!(await requireAdminRole())) redirect('/login');
  const { leaderboard, underperforming, needsProfile, total } = await getTopPerformingProviders({ days: 30, limit: 15 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Provider performance</h2>
        <a href="/analytics" className="text-sm font-semibold text-brand hover:underline">← Analytics</a>
      </div>
      <AnalyticsTabs />
      <p className="text-xs text-gray-500">{total} published providers · last 30 days</p>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Leaderboard (views × booking rate × rating)</h3>
        {leaderboard.length === 0 ? <p className="text-sm text-gray-400">No provider data yet.</p> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Provider</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Views</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Bookings</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Conv %</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Rating</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Score</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((p, i) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{p.display_name}<span className="block text-xs text-gray-400">{[p.specialty, p.district].filter(Boolean).join(' · ')}</span></td>
                    <td className="px-3 py-2 text-right">{p.views}</td>
                    <td className="px-3 py-2 text-right">{p.bookings}</td>
                    <td className="px-3 py-2 text-right">{p.conversion_rate}%</td>
                    <td className="px-3 py-2 text-right">{p.avg_rating || '—'}{p.review_count ? <span className="text-xs text-gray-400"> ({p.review_count})</span> : null}</td>
                    <td className="px-3 py-2 text-right font-bold text-brand">{p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-amber-600">Underperforming (low views, 0 bookings)</h3>
          {underperforming.length === 0 ? <p className="text-sm text-gray-400">None — all providers are getting traction.</p> : (
            <ul className="space-y-2">
              {underperforming.map((p) => (
                <li key={p.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                  <span className="font-medium text-gray-800">{p.display_name}</span>
                  <span className="block text-xs text-gray-500">{p.views} views · {p.bookings} bookings · {[p.specialty, p.district].filter(Boolean).join(' · ')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Needs profile completion</h3>
          {needsProfile.length === 0 ? <p className="text-sm text-gray-400">All profiles complete. 🎉</p> : (
            <ul className="space-y-2">
              {needsProfile.map((p) => (
                <li key={p.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                  <span className="font-medium text-gray-800">{p.display_name}</span>
                  <span className="ml-2 text-xs text-red-500">missing: {p.missing.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
