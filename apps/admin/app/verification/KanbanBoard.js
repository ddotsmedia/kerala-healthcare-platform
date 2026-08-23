'use client';

// Provider verification pipeline — kanban with HTML5 drag between columns.
// Drop → PATCH the provider's status (verified auto-publishes). Reject asks for
// a reason template. Bulk-verify all pending. No packages.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/shell/Toast';

const COLUMNS = [
  { status: 'pending', label: 'Pending', hint: 'Awaiting review' },
  { status: 'in_review', label: 'Documents Reviewed', hint: 'Docs checked' },
  { status: 'verified', label: 'NMC Verified · Published', hint: 'Approved + live' },
  { status: 'rejected', label: 'Rejected', hint: 'Declined' }
];
const REJECT_REASONS = [
  'Documents unclear or incomplete',
  'NMC registration number not found',
  'Details do not match the NMC registry',
  'Duplicate provider profile',
  'Other (see notes)'
];

export default function KanbanBoard({ lanes }) {
  const [cols, setCols] = useState(lanes);
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function patch(id, status, reason) {
    const r = await fetch(`/api/admin/verification/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason })
    });
    return r.ok;
  }

  function findCard(id) {
    for (const s of Object.keys(cols)) { const c = cols[s].find((x) => x.id === id); if (c) return { card: c, from: s }; }
    return {};
  }

  async function move(id, toStatus) {
    const { card, from } = findCard(id);
    if (!card || from === toStatus) return;
    let reason = null;
    if (toStatus === 'rejected') {
      reason = window.prompt(`Rejection reason:\n${REJECT_REASONS.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nType a number or your own reason:`);
      if (reason == null) return;
      const n = parseInt(reason, 10);
      if (n >= 1 && n <= REJECT_REASONS.length) reason = REJECT_REASONS[n - 1];
    }
    setBusy(true);
    // optimistic
    setCols((c) => {
      const next = { ...c };
      next[from] = next[from].filter((x) => x.id !== id);
      next[toStatus] = [{ ...card, status: toStatus }, ...next[toStatus]];
      return next;
    });
    const ok = await patch(id, toStatus, reason);
    setBusy(false);
    if (ok) { toast(`Moved to ${toStatus}`, 'success'); router.refresh(); }
    else { toast('Move failed', 'error'); setCols(lanes); }
  }

  async function bulkVerify() {
    const pending = cols.pending || [];
    if (pending.length === 0) return;
    if (!window.confirm(`Verify + publish all ${pending.length} pending providers?`)) return;
    setBusy(true);
    for (const c of pending) await patch(c.id, 'verified');
    setBusy(false);
    toast(`Verified ${pending.length} providers`, 'success');
    router.refresh();
  }

  const onDrop = (status) => (e) => { e.preventDefault(); setOver(null); if (dragId) move(dragId, status); setDragId(null); };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={bulkVerify} disabled={busy || (cols.pending || []).length === 0}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
          ✓ Bulk verify pending ({(cols.pending || []).length})
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const cards = cols[col.status] || [];
          return (
            <div key={col.status}
              onDragOver={(e) => { e.preventDefault(); setOver(col.status); }}
              onDragLeave={() => setOver((o) => (o === col.status ? null : o))}
              onDrop={onDrop(col.status)}
              className={`kanban-col flex min-h-[8rem] flex-col rounded-2xl border border-line bg-surface-2 p-2 ${over === col.status ? 'drag-over' : ''}`}>
              <div className="mb-2 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-bold text-ink">{col.label}</p>
                  <p className="text-[11px] text-ink-soft">{col.hint}</p>
                </div>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-ink-soft">{cards.length}</span>
              </div>
              <div className="flex-1 space-y-2">
                {cards.length === 0 && <p className="px-1 py-6 text-center text-xs text-ink-soft">Drop here</p>}
                {cards.map((c) => (
                  <div key={c.id} draggable
                    onDragStart={() => setDragId(c.id)} onDragEnd={() => setDragId(null)}
                    className={`kanban-card cursor-grab rounded-xl border border-line bg-surface p-3 shadow-sm active:cursor-grabbing ${dragId === c.id ? 'dragging' : ''}`}>
                    <div className="flex items-start gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm">{c.provider_type === 'hospital' ? '🏥' : '🩺'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{c.provider_name || '(unnamed)'}</p>
                        <p className="truncate text-xs text-ink-soft">{c.specialty_en || c.provider_type}{c.nmc_registration_no ? ` · NMC ${c.nmc_registration_no}` : ''}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <a href={`/verification/${c.id}`} className="text-xs font-semibold text-brand hover:underline">Review →</a>
                      {col.status !== 'verified' && col.status !== 'rejected' && (
                        <div className="flex gap-1.5">
                          <button type="button" disabled={busy} onClick={() => move(c.id, 'verified')} className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-700">Approve</button>
                          <button type="button" disabled={busy} onClick={() => move(c.id, 'rejected')} className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700">Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-soft">Tip: drag a card between columns, or use Approve/Reject. Approving publishes the provider automatically.</p>
    </div>
  );
}
