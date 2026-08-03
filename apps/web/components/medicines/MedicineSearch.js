'use client';

// MedicineSearch — search box with live autocomplete (generic or brand name).
// Submitting navigates to ?q=; picking a suggestion opens the medicine page.
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicineSearch({ locale = 'ml', initialQuery = '' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setItems([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const j = await res.json();
        setItems(j.data || []); setOpen(true);
      } catch { /* aborted */ }
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const onClick = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  function submit(e) {
    e.preventDefault();
    router.push(`/${locale}/medicines?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  return (
    <div ref={box} className="relative">
      <form onSubmit={submit}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => items.length && setOpen(true)}
          placeholder={ml ? 'ജനറിക് അല്ലെങ്കിൽ ബ്രാൻഡ് പേര് തിരയൂ…' : 'Search by generic or brand name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand focus:outline-none"
          aria-label={ml ? 'മരുന്ന് തിരയൂ' : 'Search medicines'}
        />
      </form>
      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {items.map((m) => (
            <li key={m.slug}>
              <button type="button" onClick={() => router.push(`/${locale}/medicines/${m.slug}`)}
                className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50">
                <span>
                  <span className="font-medium text-gray-900">{(ml ? m.generic_name_ml : m.generic_name_en) || m.generic_name_en}</span>
                  {m.drug_class && <span className="ml-2 text-xs text-gray-400">{m.drug_class}</span>}
                </span>
                <span className={`shrink-0 rounded-full px-1.5 text-[10px] font-bold ${m.is_otc ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{m.is_otc ? 'OTC' : 'Rx'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
