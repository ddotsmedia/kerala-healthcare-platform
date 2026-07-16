'use client';

// AvailabilityToggle.js — registered donor flips their availability.
import { useState } from 'react';

export default function AvailabilityToggle({ initial = true, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [available, setAvailable] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !available;
    setBusy(true); setAvailable(next);
    try {
      const r = await fetch('/api/blood-donors/availability', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: next })
      });
      if (!r.ok) setAvailable(!next);
    } catch { setAvailable(!next); }
    setBusy(false);
  }

  return (
    <button type="button" onClick={toggle} disabled={busy}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${available ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
      <span className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`} />
      {available ? (ml ? 'ലഭ്യമാണ്' : 'Available') : (ml ? 'ലഭ്യമല്ല' : 'Unavailable')}
    </button>
  );
}
