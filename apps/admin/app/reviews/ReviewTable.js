'use client';

// Review moderation via the shared DataTable — search, sort, bulk approve/reject,
// row quick actions, CSV export. Calls the admin reviews API.

import DataTable from '@/components/table/DataTable';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const day = (d) => new Date(d).toISOString().slice(0, 10);

async function act(id, action, reason) {
  const r = await fetch(`/api/reviews/${id}/${action}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reason ? { reason } : {})
  });
  return r.ok;
}

export default function ReviewTable({ reviews, status }) {
  const moderate = status === 'pending' || status === 'flagged';

  const columns = [
    { key: 'entity_name', label: 'Entity', sortable: true, exportValue: (r) => `${r.entity_name || ''} (${r.entity_type})`,
      render: (r) => <><span className="font-medium">{r.entity_name || '—'}</span><span className="block text-xs text-ink-soft">{r.entity_type}</span></> },
    { key: 'patient_name', label: 'Patient', sortable: true, exportValue: (r) => (r.is_anonymous ? 'Anonymous' : r.patient_name || ''),
      render: (r) => <span className="text-ink-soft">{r.is_anonymous ? 'Anonymous' : (r.patient_name || '—')}</span> },
    { key: 'rating', label: 'Rating', sortable: true, exportValue: (r) => r.rating, render: (r) => <span className="text-amber-500">{stars(r.rating)}</span> },
    { key: 'body', label: 'Review', exportValue: (r) => `${r.title || ''} ${r.body || ''}`.trim(),
      render: (r) => <div className="max-w-xs">{r.title && <span className="block font-semibold">{r.title}</span>}<span className="text-ink-soft">{r.body}</span>{r.rejection_reason && <span className="mt-1 block text-xs text-red-600">Reason: {r.rejection_reason}</span>}</div> },
    { key: 'created_at', label: 'Submitted', sortable: true, exportValue: (r) => day(r.created_at), render: (r) => <span className="text-xs text-ink-soft">{day(r.created_at)}</span> }
  ];

  const bulkActions = moderate ? [
    { label: 'Approve', tone: 'green', confirm: 'Approve {n} selected review(s)?', run: async (ids) => { for (const id of ids) await act(id, 'approve'); return true; } },
    { label: 'Reject', tone: 'red', run: async (ids) => { const reason = window.prompt('Rejection reason for selected:'); if (reason == null) return false; for (const id of ids) await act(id, 'reject', reason); return true; } }
  ] : [];

  const rowActions = (r) => (moderate ? [
    { label: 'Approve', tone: 'green', run: (id) => act(id, 'approve') },
    { label: 'Reject', tone: 'red', run: (id) => { const reason = window.prompt('Rejection reason:'); if (reason == null) return false; return act(id, 'reject', reason); } }
  ] : []);

  return (
    <DataTable rows={reviews} columns={columns} bulkActions={bulkActions} rowActions={rowActions}
      searchKeys={['entity_name', 'patient_name', 'title', 'body']} exportName={`reviews-${status}`}
      emptyMessage={`No “${status}” reviews.`} />
  );
}
