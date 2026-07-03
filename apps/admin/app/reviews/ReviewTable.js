'use client';

// Moderation table — approve/reject (with reason) + bulk approve. Calls admin API.
import { useState } from 'react';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function ReviewTable({ reviews, status }) {
  const [rows, setRows] = useState(reviews);
  const [busy, setBusy] = useState(false);

  async function act(id, action, reason) {
    const r = await fetch(`/api/reviews/${id}/${action}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reason ? { reason } : {})
    });
    return r.ok;
  }

  async function approve(id) {
    setBusy(true);
    if (await act(id, 'approve')) setRows((rs) => rs.filter((x) => x.id !== id));
    setBusy(false);
  }
  async function reject(id) {
    const reason = window.prompt('Rejection reason:');
    if (reason == null) return;
    setBusy(true);
    if (await act(id, 'reject', reason)) setRows((rs) => rs.filter((x) => x.id !== id));
    setBusy(false);
  }
  async function bulkApprove() {
    if (!window.confirm(`Approve all ${rows.length} reviews?`)) return;
    setBusy(true);
    for (const r of rows) await act(r.id, 'approve');
    setRows([]);
    setBusy(false);
  }

  if (rows.length === 0) return <p className="py-8 text-center text-sm text-gray-500">No “{status}” reviews.</p>;

  return (
    <div className="space-y-3">
      {status === 'pending' && (
        <div className="flex justify-end">
          <button type="button" onClick={bulkApprove} disabled={busy}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
            Bulk approve all
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Entity</th><th className="px-3 py-2">Patient</th>
              <th className="px-3 py-2">Rating</th><th className="px-3 py-2">Review</th>
              <th className="px-3 py-2">Submitted</th><th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-2">
                  <span className="font-medium text-gray-900">{r.entity_name || '—'}</span>
                  <span className="block text-xs text-gray-400">{r.entity_type}</span>
                </td>
                <td className="px-3 py-2 text-gray-700">{r.is_anonymous ? 'Anonymous' : (r.patient_name || '—')}</td>
                <td className="px-3 py-2 text-amber-500">{stars(r.rating)}</td>
                <td className="max-w-xs px-3 py-2">
                  {r.title && <span className="block font-semibold text-gray-900">{r.title}</span>}
                  <span className="text-gray-600">{r.body}</span>
                  {r.rejection_reason && <span className="mt-1 block text-xs text-red-600">Reason: {r.rejection_reason}</span>}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">{new Date(r.created_at).toISOString().slice(0, 10)}</td>
                <td className="px-3 py-2">
                  {status === 'pending' || status === 'flagged' ? (
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => approve(r.id)} disabled={busy}
                        className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60">Approve</button>
                      <button type="button" onClick={() => reject(r.id)} disabled={busy}
                        className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60">Reject</button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">{status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
