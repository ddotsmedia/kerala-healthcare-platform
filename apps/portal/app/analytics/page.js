// "Your Performance" — the logged-in doctor's own analytics dashboard.
// Profile views, appointments, rating, search appearances + 30-day views chart.

import { EmptyState } from '@khp/ui';
import { currentDoctorId, getMyProfile } from '@/lib/profile';
import { getProfileStats, completenessTips } from '@/lib/doctorAnalytics';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your performance · KHP Portal' };

function ViewsChart({ series }) {
  const data = series || [];
  if (data.length === 0) return <EmptyState message="No view data yet." />;
  const max = Math.max(1, ...data.map((p) => p.n));
  const W = 320, H = 64, gap = 2;
  const bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full" preserveAspectRatio="none" role="img" aria-label="Profile views, last 30 days">
      {data.map((p, i) => {
        const h = Math.round((p.n / max) * (H - 4));
        return <rect key={p.day} x={i * (bw + gap)} y={H - h} width={bw} height={h} rx="1" className="fill-brand" />;
      })}
    </svg>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-gray-400">{sub}</p> : null}
    </div>
  );
}

export default async function DoctorAnalyticsPage() {
  const id = await currentDoctorId();
  if (!id) return <EmptyState message="Sign in as a doctor to view your performance." />;

  const [stats, profile] = await Promise.all([getProfileStats(id, 30), getMyProfile(id)]);
  const tips = completenessTips(profile);
  const maxMode = Math.max(1, ...stats.byMode.map((m) => m.n));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Your performance</h2>
        <p className="text-xs text-gray-500">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Profile views" value={stats.profile_views} sub={`${stats.unique_visitors} unique`} />
        <StatCard label="Appointments booked" value={stats.appointment_count} />
        <StatCard label="Avg rating" value={stats.review_avg != null ? `${stats.review_avg}★` : '—'} sub={`${stats.review_count} reviews`} />
        <StatCard label="Search appearances" value={stats.search_appearances != null ? stats.search_appearances : '—'} sub="coming soon" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Profile views — last 30 days</h3>
        <ViewsChart series={stats.appointment_trend} />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Appointments by mode</h3>
        {stats.byMode.length === 0 ? <EmptyState message="No appointments in this period." /> : (
          <div className="space-y-2">
            {stats.byMode.map((m) => (
              <div key={m.mode} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-sm text-gray-700">{m.label}</span>
                <div className="h-4 flex-1 rounded bg-gray-100"><div className="h-4 rounded bg-brand" style={{ width: `${(m.n / maxMode) * 100}%` }} /></div>
                <span className="w-8 text-right text-xs font-semibold text-gray-600">{m.n}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Recent reviews</h3>
        {stats.recentReviews.length === 0 ? <EmptyState message="No approved reviews yet." /> : (
          <div className="space-y-2">
            {stats.recentReviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-sm font-semibold text-amber-600">{'★'.repeat(r.rating)}<span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span></p>
                {r.title ? <p className="text-sm font-medium text-gray-800">{r.title}</p> : null}
                {r.body ? <p className="text-sm text-gray-600">{r.body}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {tips.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-800">Tips to grow your profile</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
            {tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
