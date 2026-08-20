// Wellness & Yoga — category filter, wellness article cards.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listWellness, WELLNESS_CATEGORIES } from '@/lib/wellness';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'വെൽനെസ് & യോഗ | MalayaliDoctor' : 'Wellness & Yoga | MalayaliDoctor',
    description: ml
      ? 'യോഗ, ധ്യാനം, ശ്വസനം, ഫിറ്റ്നസ്, ഉറക്കം, സ്ട്രെസ് മാനേജ്മെന്റ് — ആരോഗ്യകരമായ ജീവിതത്തിന്.'
      : 'Yoga, meditation, breathing, fitness, sleep and stress management for healthier living.'
  };
}

export default async function WellnessIndex(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const category = sp.category || '';

  const items = await listWellness({ category: category || undefined });
  const base = `/${locale}/wellness`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;
  const catOf = (slug) => WELLNESS_CATEGORIES.find((c) => c.slug === slug);

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🧘 {ml ? 'വെൽനെസ് & യോഗ' : 'Wellness & Yoga'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'ശരീരത്തിനും മനസ്സിനും ആരോഗ്യം' : 'Health for body and mind'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={base} className={chip(!category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {WELLNESS_CATEGORIES.map((c) => (
              <Link key={c.slug} href={`${base}?category=${c.slug}`} className={chip(category === c.slug)}>{c.icon} {ml ? c.ml : c.en}</Link>
            ))}
          </nav>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          {items.length === 0 ? (
            <EmptyState title={ml ? 'ഒന്നും കണ്ടെത്തിയില്ല' : 'Nothing found'} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((w) => {
                const c = catOf(category);
                return (
                  <Link key={w.id} href={`/${locale}/wellness/${w.slug}`} className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand">
                    <div className="text-2xl">{c?.icon || '🧘'}</div>
                    <h2 className="mt-1 text-base font-bold text-gray-900">{(ml ? w.title_ml : w.title_en) || w.title_en}</h2>
                    {(w.excerpt_ml || w.excerpt_en) && <p className="mt-1 text-sm text-gray-600">{(ml ? w.excerpt_ml : w.excerpt_en) || w.excerpt_en}</p>}
                    <p className="mt-2 text-xs font-semibold text-brand">{ml ? 'വായിക്കൂ →' : 'Read →'}</p>
                  </Link>
                );
              })}
            </div>
          )}
          <div role="note" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഏതെങ്കിലും വ്യായാമ പരിപാടി ആരംഭിക്കുന്നതിന് മുമ്പ്, പ്രത്യേകിച്ച് ആരോഗ്യപ്രശ്നമുണ്ടെങ്കിൽ, ഡോക്ടറെ സമീപിക്കുക.'
              : 'Consult your doctor before starting any exercise program, especially if you have a medical condition.'}
          </div>
        </div>
      </FullBleed>
    </div>
  );
}
