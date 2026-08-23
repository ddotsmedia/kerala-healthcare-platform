'use client';

// Live stat cards + activity feed. Subscribes to the SSE stream; falls back to
// 30s polling if SSE fails. Initial data is server-rendered for instant paint.

import { useEffect, useState } from 'react';

const CARDS = [
  { key: 'active_now', label: 'Active users now', icon: '🟢', live: true },
  { key: 'appts_today', label: 'Appointments today', icon: '📅' },
  { key: 'regs_today', label: 'New registrations today', icon: '🩺' },
  { key: 'pending_reviews', label: 'Pending reviews', icon: '★' }
];
const FEED_ICON = { new_booking: '📅', new_review: '★', new_registration: '🩺', new_question: '？', system_alert: '⚠' };
const rel = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`;
};

export default function LiveDashboard({ initialStats, initialFeed }) {
  const [stats, setStats] = useState(initialStats || {});
  const [feed, setFeed] = useState(initialFeed || []);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let es, poll;
    const startPoll = () => {
      if (poll) return;
      poll = setInterval(async () => {
        try {
          const r = await fetch('/api/admin/stats', { cache: 'no-store' });
          if (r.ok) { const j = await r.json(); if (j.data) { setStats(j.data.stats); setFeed(j.data.feed); } }
        } catch { /* offline */ }
      }, 30000);
    };
    try {
      es = new EventSource('/api/admin/live');
      es.onopen = () => setLive(true);
      es.addEventListener('stats', (e) => { try { setStats(JSON.parse(e.data)); } catch { /* noop */ } });
      es.addEventListener('notifications', (e) => { try { setFeed(JSON.parse(e.data)); } catch { /* noop */ } });
      es.onerror = () => { setLive(false); try { es.close(); } catch { /* noop */ } startPoll(); };
    } catch { startPoll(); }
    return () => { if (es) es.close(); if (poll) clearInterval(poll); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              {c.live && <span className={`flex items-center gap-1 text-[10px] font-semibold ${live ? 'text-emerald-500' : 'text-ink-soft'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 pulse-dot' : 'bg-slate-400'}`} />{live ? 'LIVE' : 'poll'}</span>}
            </div>
            <p className="mt-2 text-3xl font-extrabold text-brand">{stats[c.key] ?? 0}</p>
            <p className="text-xs text-ink-soft">{c.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h3 className="text-sm font-bold text-ink">Live activity</h3>
          <span className="text-xs text-ink-soft">auto-refresh</span>
        </div>
        {feed.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-soft">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-line">
            {feed.slice(0, 10).map((e, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm">{FEED_ICON[e.type] || '•'}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.title}</span>
                <span className="shrink-0 text-xs text-ink-soft">{rel(e.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
