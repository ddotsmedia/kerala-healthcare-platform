'use client';

// CompareToggle.js — "Compare" checkbox for a hospital card. Adds/removes the
// hospital from the compare bar (localStorage, max 3).
import { useEffect, useState } from 'react';
import { toggle, has, EVENT, MAX } from './compareStore.js';

export default function CompareToggle({ hospital, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(has(hospital.id));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [hospital.id]);

  function onChange(e) {
    e.preventDefault(); e.stopPropagation();
    const ok = toggle({ id: hospital.id, name: hospital.name, slug: hospital.slug });
    if (!ok) { window.alert(ml ? `പരമാവധി ${MAX} ആശുപത്രികൾ താരതമ്യം ചെയ്യാം.` : `You can compare up to ${MAX} hospitals.`); return; }
    setOn(has(hospital.id));
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-gray-600" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={on} onChange={onChange} className="h-4 w-4 rounded border-gray-300" />
      {ml ? 'താരതമ്യം' : 'Compare'}
    </label>
  );
}
