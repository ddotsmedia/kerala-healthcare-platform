// Admin analytics dashboard — KPIs from cached SQL aggregates.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getMetrics } from '@/lib/analytics';

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

export default async function Analytics() {
  if (!requireAdminRole()) redirect('/login');
  const m = await getMetrics();

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold">Platform analytics</h2>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Users</h3>
        <div className="grid grid-cols-3 gap-3">
          <Card label="Total" value={m.users_total} />
          <Card label="New today" value={m.users_today} />
          <Card label="New this week" value={m.users_week} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Appointments</h3>
        <div className="grid grid-cols-3 gap-3">
          <Card label="Confirmed" value={m.appts_confirmed} />
          <Card label="Today" value={m.appts_today} />
          <Card label="Cancellation rate" value={`${m.cancellation_rate}%`} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Providers · Content · Jobs · AI</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card label="Verified providers" value={m.providers_verified} sub={`${m.providers_pending} pending`} />
          <Card label="Content published" value={m.content_published} sub={`${m.content_review} in review`} />
          <Card label="Active jobs" value={m.jobs_active} sub={`${m.applications_week} apps/wk`} />
          <Card label="AI chats today" value={m.ai_today} />
        </div>
      </section>
    </div>
  );
}
