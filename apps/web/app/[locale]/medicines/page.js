// Medicine Information Centre — search, A-Z index, category tabs, medicine cards.
// Educational only.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listMedicines, azLetters, MED_CATEGORIES } from '@/lib/medicines';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState, Pagination } from '@khp/ui';
import MedicineCard from '@/components/medicines/MedicineCard';
import MedicineSearch from '@/components/medicines/MedicineSearch';

export const dynamic = 'force-dynamic';
const LIMIT = 24;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'മരുന്ന് വിവരങ്ങൾ — കേരള ഹെൽത്ത് | MalayaliDoctor' : 'Medicine Information — Kerala Health | MalayaliDoctor',
    description: ml
      ? 'മരുന്നുകളുടെ ഉപയോഗം, പാർശ്വഫലങ്ങൾ, മുൻകരുതലുകൾ — വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രം. ഡോക്ടറെ സമീപിക്കുക.'
      : 'Uses, side effects and precautions of common medicines — educational only. Always consult your doctor.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function MedicinesIndex(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const cur = { q: sp.q || '', category: sp.category || '', letter: sp.letter || '' };

  const [medicines, letters] = await Promise.all([
    listMedicines({ q: cur.q, category: cur.category, letter: cur.letter, page, limit: LIMIT }),
    azLetters()
  ]);
  const base = `/${locale}/medicines`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;
  const has = new Set(letters);

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">💊 {ml ? 'മരുന്ന് വിവരങ്ങൾ' : 'Medicine Information'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'ഉപയോഗം, പാർശ്വഫലങ്ങൾ, മുൻകരുതലുകൾ — വിദ്യാഭ്യാസത്തിന് മാത്രം' : 'Uses, side effects and precautions — for education only'}</p>
          <div className="mt-4">
            <MedicineSearch locale={locale} initialQuery={cur.q} />
          </div>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-5xl space-y-3 px-4">
          {/* Category tabs */}
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={qs(base, { q: cur.q })} className={chip(!cur.category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {MED_CATEGORIES.map((c) => (
              <Link key={c.key} href={qs(base, { category: c.key })} className={chip(cur.category === c.key)}>
                {ml ? c.ml : c.en}
              </Link>
            ))}
          </nav>
          {/* A-Z index */}
          <nav className="flex flex-wrap gap-1" aria-label={ml ? 'A-Z സൂചിക' : 'A-Z index'}>
            <Link href={base} className={`rounded px-2 py-1 text-xs font-semibold ${!cur.letter ? 'bg-brand text-white' : 'text-gray-600 hover:text-brand'}`}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {ALPHABET.map((L) => (
              has.has(L)
                ? <Link key={L} href={qs(base, { letter: L })} className={`rounded px-2 py-1 text-xs font-semibold ${cur.letter.toUpperCase() === L ? 'bg-brand text-white' : 'text-brand hover:underline'}`}>{L}</Link>
                : <span key={L} className="rounded px-2 py-1 text-xs font-semibold text-gray-300">{L}</span>
            ))}
          </nav>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {medicines.length === 0 ? (
            <EmptyState title={ml ? 'മരുന്നുകളൊന്നും കണ്ടെത്തിയില്ല' : 'No medicines found'} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {medicines.map((m) => <MedicineCard key={m.id} medicine={m} locale={locale} />)}
            </div>
          )}
          <div className="mt-6">
            <Pagination basePath={base} query={cur} page={page} hasNext={medicines.length === LIMIT} locale={locale} />
          </div>

          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രം — ഇത് ഒരു കുറിപ്പടിയല്ല. ഡോക്ടറുടെ ഉപദേശമില്ലാതെ മരുന്ന് ആരംഭിക്കുകയോ നിർത്തുകയോ മാറ്റുകയോ ചെയ്യരുത്.'
              : 'This information is for education only — it is not a prescription. Never start, stop or change any medication without your doctor’s advice.'}
          </p>
        </div>
      </FullBleed>
    </div>
  );
}
