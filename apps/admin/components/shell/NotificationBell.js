'use client';

// Notification center — bell + unread badge + dropdown (last 20). Events come
// from the admin activity API (synthesized from live tables). "Read" state is
// tracked client-side via a lastSeen timestamp (localStorage); SSE pushes new
// events in real time, falling back to a 30s poll.

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

const TYPE_META = {
  new_review: { icon: '★', label: 'Review' },
  new_registration: { icon: '🩺', label: 'Registration' },
  new_question: { icon: '？', label: 'Question' },
  new_booking: { icon: '📅', label: 'Booking' },
  flagged_content: { icon: '⚑', label: 'Flagged' },
  system_alert: { icon: '⚠', label: 'System' }
};
const LS = 'khp-admin-notif-seen';
const rel = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seen, setSeen] = useState(0);
  const router = useRouter();
  const ref = useRef(null);

  useEffect(() => {
    try { setSeen(Number(localStorage.getItem(LS)) || 0); } catch { /* noop */ }
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (r.ok) { const j = await r.json(); setItems(Array.isArray(j.data) ? j.data : []); }
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 30000);
    let es;
    try {
      es = new EventSource('/api/admin/live');
      es.addEventListener('notifications', (e) => {
        try { const d = JSON.parse(e.data); if (Array.isArray(d)) setItems(d); } catch { /* noop */ }
      });
    } catch { /* SSE unsupported */ }
    return () => { clearInterval(poll); if (es) es.close(); };
  }, [load]);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = items.filter((i) => new Date(i.created_at).getTime() > seen).length;
  const markAll = () => { const now = Date.now(); try { localStorage.setItem(LS, String(now)); } catch { /* noop */ } setSeen(now); };
  const go = (href) => { markAll(); setOpen(false); if (href) router.push(href); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:text-brand hover:border-brand">
        <Icon name="bell" className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-brand hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-ink-soft">No recent activity.</p>
            ) : items.slice(0, 20).map((n, i) => {
              const m = TYPE_META[n.type] || TYPE_META.system_alert;
              const isNew = new Date(n.created_at).getTime() > seen;
              return (
                <button key={`${n.type}-${i}`} onClick={() => go(n.href)}
                  className={`flex w-full items-start gap-3 border-b border-line px-3 py-2.5 text-left last:border-0 hover:bg-surface-2 ${isNew ? 'bg-teal-50/40 dark:bg-teal-900/10' : ''}`}>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm">{m.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{n.title}</span>
                    <span className="text-xs text-ink-soft">{m.label} · {rel(n.created_at)} ago</span>
                  </span>
                  {isNew && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
