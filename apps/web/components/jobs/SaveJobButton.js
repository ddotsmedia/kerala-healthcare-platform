'use client';

// Save/bookmark a job. POST/DELETE /api/jobs/[id]/save. 401 -> login.
import { useState } from 'react';

export default function SaveJobButton({ jobId, locale = 'ml', loginPath = '/ml/login' }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    e.preventDefault(); e.stopPropagation();
    setBusy(true);
    try {
      const r = await fetch(`/api/jobs/${jobId}/save`, { method: saved ? 'DELETE' : 'POST' });
      if (r.status === 401) { window.location.href = loginPath; return; }
      if (r.ok) setSaved((s) => !s);
    } catch { /* noop */ } finally { setBusy(false); }
  }
  return (
    <button type="button" onClick={toggle} disabled={busy}
      aria-pressed={saved} aria-label={locale === 'ml' ? 'ജോലി സേവ് ചെയ്യുക' : 'Save job'}
      className={`rounded-lg border px-2.5 py-1.5 text-sm ${saved ? 'border-brand bg-teal-50 text-brand' : 'border-gray-300 text-gray-500 hover:border-brand hover:text-brand'}`}>
      {saved ? '★' : '☆'}
    </button>
  );
}
