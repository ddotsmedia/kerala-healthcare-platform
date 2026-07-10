'use client';

// CompareBar.js — floating bottom bar of hospitals selected for comparison
// (max 3). Reads the localStorage compare store; links to /compare?h=ids.
import { useEffect, useState } from 'react';
import { read, remove, clear, EVENT } from './compareStore.js';

export default function CompareBar({ locale = 'ml' }) {
  const ml = locale === 'ml';
  const [items, setItems] = useState([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);

  if (!items.length) return null;
  const href = `/${locale}/compare?h=${items.map((x) => x.id).join(',')}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">{ml ? 'താരതമ്യം' : 'Compare'}:</span>
        <div className="flex flex-1 flex-wrap gap-2">
          {items.map((x) => (
            <span key={x.id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {x.name}
              <button type="button" onClick={() => remove(x.id)} aria-label="remove" className="text-gray-400 hover:text-red-600">✕</button>
            </span>
          ))}
        </div>
        <button type="button" onClick={clear} className="text-xs text-gray-500 hover:text-gray-700">{ml ? 'മായ്ക്കുക' : 'Clear'}</button>
        <a href={items.length >= 2 ? href : undefined} aria-disabled={items.length < 2}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${items.length >= 2 ? 'bg-brand hover:bg-brand-dark' : 'cursor-not-allowed bg-gray-300'}`}>
          {ml ? `താരതമ്യം ചെയ്യുക (${items.length})` : `Compare (${items.length})`}
        </a>
      </div>
    </div>
  );
}
