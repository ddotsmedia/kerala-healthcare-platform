'use client';

// Forum moderation — approve/reject posts + replies.
import { useState } from 'react';

export default function ForumTable({ posts = [], replies = [], status }) {
  const [p, setP] = useState(posts);
  const [r, setR] = useState(replies);
  const [busy, setBusy] = useState(false);

  async function act(kind, id, action) {
    setBusy(true);
    const res = await fetch('/api/forum/action', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, action })
    });
    if (res.ok) {
      if (kind === 'post') setP((xs) => xs.filter((x) => x.id !== id));
      else setR((xs) => xs.filter((x) => x.id !== id));
    }
    setBusy(false);
  }

  const actionable = status === 'pending' || status === 'flagged';
  if (p.length === 0 && r.length === 0) return <p className="py-8 text-center text-sm text-gray-500">No “{status}” items.</p>;

  return (
    <div className="space-y-5">
      {p.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Posts ({p.length})</h3>
          <div className="space-y-2">
            {p.map((x) => (
              <div key={x.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-900">{x.title}</span>
                    <span className="block text-xs text-gray-400">{x.category_name} · {x.is_anonymous ? 'Anonymous' : x.author_name} · {new Date(x.created_at).toISOString().slice(0, 10)}</span>
                    <p className="mt-1 text-gray-600">{x.body}</p>
                  </div>
                  {actionable && (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => act('post', x.id, 'approve')} disabled={busy} className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white">Approve</button>
                      <button onClick={() => act('post', x.id, 'reject')} disabled={busy} className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Replies ({r.length})</h3>
          <div className="space-y-2">
            {r.map((x) => (
              <div key={x.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400">on “{x.post_title}” · {x.is_anonymous ? 'Anonymous' : x.author_name}{x.is_doctor_reply ? ' · Doctor' : ''}</span>
                    <p className="mt-1 text-gray-700">{x.body}</p>
                  </div>
                  {actionable && (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => act('reply', x.id, 'approve')} disabled={busy} className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white">Approve</button>
                      <button onClick={() => act('reply', x.id, 'reject')} disabled={busy} className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
