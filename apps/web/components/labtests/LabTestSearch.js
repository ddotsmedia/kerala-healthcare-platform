'use client';

// LabTestSearch — search box with live autocomplete (test name or abbreviation).
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LabTestSearch({ locale = 'ml', initialQuery = '' }) {
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
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lab-tests/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const j = await res.json();
        setItems(j.data || []); setOpen(true);
      } catch { /* aborted */ }
    }, 200);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const onClick = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  function submit(e) {
    e.preventDefault();
    router.push(`/${locale}/lab-tests?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  return (
    <div ref={box} className="relative">
      <form onSubmit={submit}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => items.length && setOpen(true)}
          placeholder={ml ? 'ടെസ്റ്റിന്റെ പേര് അല്ലെങ്കിൽ ചുരുക്കപ്പേര്…' : 'Search by test name or abbreviation…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand focus:outline-none"
          aria-label={ml ? 'ലാബ് ടെസ്റ്റ് തിരയൂ' : 'Search lab tests'}
        />
      </form>
      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {items.map((t) => (
            <li key={t.slug}>
              <button type="button" onClick={() => router.push(`/${locale}/lab-tests/${t.slug}`)}
                className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50">
                <span className="font-medium text-gray-900">{(ml ? t.name_ml : t.name_en) || t.name_en}</span>
                {t.abbreviation && <span className="shrink-0 rounded bg-gray-100 px-1.5 text-[10px] font-bold text-gray-600">{t.abbreviation}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
