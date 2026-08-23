'use client';

// Date range picker — 7 / 30 / 90 days + custom. Updates ?days= in the URL.

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const PRESETS = [{ d: 7, label: '7d' }, { d: 30, label: '30d' }, { d: 90, label: '90d' }];

export default function DateRangePicker({ defaultDays = 30 }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = Number(params.get('days')) || defaultDays;
  const [custom, setCustom] = useState('');

  const apply = (d) => {
    const p = new URLSearchParams(params.toString());
    p.set('days', String(d));
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-0.5">
      {PRESETS.map((p) => (
        <button key={p.d} onClick={() => apply(p.d)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${current === p.d ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink'}`}>{p.label}</button>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); const n = parseInt(custom, 10); if (n >= 1 && n <= 365) apply(n); }} className="flex items-center">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} type="number" min="1" max="365" placeholder="custom"
          className="w-16 rounded-md border-0 bg-transparent px-1.5 py-1 text-xs text-ink placeholder:text-ink-soft focus:outline-none" />
      </form>
    </div>
  );
}
