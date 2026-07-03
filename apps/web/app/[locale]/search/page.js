'use client';

import { useState, useEffect, useRef, use } from 'react';
import { resolveLocale, t } from '@/lib/i18n';

const TYPES = ['doctor', 'hospital', 'article', 'disease', 'job'];

export default function SmartSearch(props) {
  const params = use(props.params);
  const locale = resolveLocale(params.locale);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      const u = new URLSearchParams({ q, locale });
      if (type) u.set('type', type);
      const r = await fetch(`/api/search?${u.toString()}`);
      const j = await r.json();
      setResults(j.data || []);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q, type, locale]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t(locale, 'smart_search')}</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(locale, 'search_placeholder')}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
      <nav className="flex flex-wrap gap-2">
        <button onClick={() => setType('')} className={`rounded-full px-3 py-1 text-xs font-medium ${!type ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>All</button>
        {TYPES.map((ty) => (
          <button key={ty} onClick={() => setType(ty)} className={`rounded-full px-3 py-1 text-xs font-medium ${type === ty ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>{ty}</button>
        ))}
      </nav>
      <div className="grid gap-2">
        {results.map((r) => (
          <a key={r.url} href={r.url} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium">{r.title}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{r.type}</span>
          </a>
        ))}
        {q.trim() && results.length === 0 && <p className="py-6 text-center text-sm text-gray-500">{t(locale, 'no_results')}</p>}
      </div>
    </div>
  );
}
