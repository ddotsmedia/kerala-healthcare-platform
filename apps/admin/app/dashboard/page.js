// Admin dashboard — live stats, 30-day trends, activity feed, quick actions, health.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { liveStats, recentEvents, trends, systemHealth } from '@/lib/dashboard';
import { LineChart } from '@/components/Charts';
import LiveDashboard from './LiveDashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard · KHP Admin' };

const QUICK = [
  { href: '/reviews', label: 'Approve reviews', icon: '★' },
  { href: '/verification', label: 'Verify doctors', icon: '🩺' },
  { href: '/qa', label: 'Moderate Q&A', icon: '？' },
  { href: '/analytics/search', label: 'Health trends', icon: '📈' }
];
const Dot = ({ ok }) => <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />;

export default async function Dashboard() {
  if (!(await requireAdminRole())) redirect('/login');
  const [stats, feed, tr, health] = await Promise.all([liveStats(), recentEvents(10), trends(30), systemHealth()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Operations dashboard</h1>
        <p className="text-sm text-ink-soft">Real-time platform overview</p>
      </div>

      <LiveDashboard initialStats={stats} initialFeed={feed} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-4"><LineChart series={tr.views} label="Page views (30d)" stroke="#0d9488" /></div>
        <div className="rounded-2xl border border-line bg-surface p-4"><LineChart series={tr.appts} label="Appointments (30d)" stroke="#6366f1" /></div>
        <div className="rounded-2xl border border-line bg-surface p-4"><LineChart series={tr.regs} label="Registrations (30d)" stroke="#f59e0b" /></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">Quick actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK.map((q) => (
              <a key={q.href} href={q.href} className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-medium text-ink hover:border-brand hover:text-brand">
                <span>{q.icon}</span> {q.label}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">System health</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between"><span className="text-ink-soft">Database</span><span className="flex items-center gap-2 text-ink"><Dot ok={health.db === 'ok'} /> {health.db}</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-soft">Redis</span><span className="flex items-center gap-2 text-ink"><Dot ok={health.redis === 'ok'} /> {health.redis}</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-soft">DB size</span><span className="text-ink">{health.dbSize || '—'} · {health.tables} tables</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-soft">Backups</span><span className="text-ink">{health.backups}</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-soft">Disk</span><span className="text-ink">{health.disk}</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
