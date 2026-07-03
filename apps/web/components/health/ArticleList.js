'use client';

// ArticleList — client search filter over server-provided article items.
import { useState } from 'react';
import ArticleCard from './ArticleCard.js';

export default function ArticleList({ items = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const shown = term
    ? items.filter((it) => `${it.title_ml || ''} ${it.title_en || ''} ${it.excerpt_en || ''}`.toLowerCase().includes(term))
    : items;

  return (
    <div className="space-y-4">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder={ml ? 'ലേഖനങ്ങൾ തിരയുക…' : 'Search articles…'}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none" />
      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">{ml ? 'ലേഖനങ്ങൾ കണ്ടെത്തിയില്ല' : 'No articles found'}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it) => <ArticleCard key={it.id} item={it} locale={locale} />)}
        </div>
      )}
    </div>
  );
}
