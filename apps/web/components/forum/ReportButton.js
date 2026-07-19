'use client';

// Report a post/reply -> POST /api/forum/report (flags for moderator).
import { useState } from 'react';

export default function ReportButton({ kind = 'post', id, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [done, setDone] = useState(false);
  async function reportIt() {
    if (done) return;
    try {
      await fetch('/api/forum/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id }) });
      setDone(true);
    } catch { /* noop */ }
  }
  return (
    <button type="button" onClick={reportIt} className="text-xs text-gray-400 hover:text-red-600">
      {done ? (ml ? '✓ റിപ്പോർട്ട് ചെയ്തു' : '✓ Reported') : (ml ? '⚑ റിപ്പോർട്ട്' : '⚑ Report')}
    </button>
  );
}
