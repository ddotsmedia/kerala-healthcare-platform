// Disease A-Z index — letter counts, category filter, search by symptom.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { listDiseasesFull, diseaseCategories, letterCounts } from '@/lib/diseases';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
import { EmptyState } from '@khp/ui';
import { FullBleed } from '@/components/home/HomeSections';

export const dynamic = 'force-dynamic';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'രോഗ വിജ്ഞാനകോശം A-Z | MalayaliDoctor' : 'Disease Encyclopedia A-Z | MalayaliDoctor',
    description: ml
      ? 'രോഗങ്ങൾ A മുതൽ Z വരെ — ലക്ഷണങ്ങൾ, കാരണങ്ങൾ, ചികിത്സ, പ്രതിരോധം. വിദ്യാഭ്യാസത്തിന് മാത്രം.'
      : 'Diseases A-Z — symptoms, causes, treatment and prevention. Educational only.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function DiseaseIndex(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const cur = { category: sp.category || '', letter: sp.letter || '', q: sp.q || '' };

  const [diseases, categories, counts] = await Promise.all([
    listDiseasesFull({ category: cur.category, letter: cur.letter, symptom: cur.q }),
    diseaseCategories(),
    letterCounts()
  ]);
  const base = `/${locale}/diseases`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">📖 {ml ? 'രോഗ വിജ്ഞാനകോശം' : 'Disease Encyclopedia'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'ലക്ഷണം തിരയൂ അല്ലെങ്കിൽ A-Z ബ്രൗസ് ചെയ്യൂ' : 'Search a symptom or browse A-Z'}</p>
          <form action={base} className="mt-4">
            <input name="q" defaultValue={cur.q}
              placeholder={ml ? 'ലക്ഷണം തിരയൂ (ഉദാ. തലവേദന)…' : 'Search a symptom (e.g. headache)…'}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-brand focus:outline-none" />
          </form>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-5xl space-y-3 px-4">
          <KnowledgeDisclaimer locale={locale} />
          {/* Category filter */}
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={qs(base, { q: cur.q })} className={chip(!cur.category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {categories.map((c) => (
              <Link key={c.slug} href={qs(base, { category: c.slug, q: cur.q })} className={chip(cur.category === c.slug)}>
                {(ml ? c.name_ml : c.name_en)} <span className="opacity-70">({c.n})</span>
              </Link>
            ))}
          </nav>
          {/* A-Z index with per-letter counts */}
          <nav className="flex flex-wrap gap-1" aria-label={ml ? 'A-Z സൂചിക' : 'A-Z index'}>
            <Link href={qs(base, { category: cur.category, q: cur.q })} className={`rounded px-2 py-1 text-xs font-semibold ${!cur.letter ? 'bg-brand text-white' : 'text-gray-600 hover:text-brand'}`}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {ALPHABET.map((L) => counts[L]
              ? <Link key={L} href={qs(base, { letter: L, category: cur.category, q: cur.q })} title={`${counts[L]}`} className={`rounded px-2 py-1 text-xs font-semibold ${cur.letter.toUpperCase() === L ? 'bg-brand text-white' : 'text-brand hover:underline'}`}>{L}<span className="ml-0.5 text-[9px] opacity-70">{counts[L]}</span></Link>
              : <span key={L} className="rounded px-2 py-1 text-xs font-semibold text-gray-300">{L}</span>
            )}
          </nav>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {diseases.length === 0 ? (
            <EmptyState title={ml ? 'ഒന്നും കണ്ടെത്തിയില്ല' : 'No diseases found'} />
          ) : (
            <>
              <p className="mb-3 text-xs text-gray-500">{diseases.length} {ml ? 'ഫലങ്ങൾ' : 'results'}</p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {diseases.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/${locale}/diseases/${d.slug}`} className="block rounded-xl border border-gray-200 bg-white p-3 hover:border-brand">
                      <span className="text-sm font-semibold text-gray-900">{(ml ? d.title_ml : d.title_en) || d.title_en}</span>
                      {(d.excerpt_ml || d.excerpt_en) && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{(ml ? d.excerpt_ml : d.excerpt_en) || d.excerpt_en}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </FullBleed>
    </div>
  );
}
