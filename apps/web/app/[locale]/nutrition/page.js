// Nutrition Database — Kerala foods with nutrition, filter by category + good-for.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listFoods, FOOD_CATEGORIES, GOOD_FOR } from '@/lib/nutrition';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 24;

const CAT_ICON = { grain: '🌾', vegetable: '🥬', fruit: '🍌', protein: '🐟', dairy: '🥛', spice: '🌶️' };

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'പോഷകാഹാര ഡാറ്റാബേസ് | MalayaliDoctor' : 'Nutrition Database | MalayaliDoctor',
    description: ml
      ? 'കേരള ഭക്ഷണങ്ങളും അവയുടെ പോഷകമൂല്യവും — കലോറി, പ്രോട്ടീൻ, ആരോഗ്യ ഗുണങ്ങൾ. വിദ്യാഭ്യാസത്തിന് മാത്രം.'
      : 'Kerala foods and their nutritional value — calories, protein and health benefits. Educational only.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

function FoodCard({ food, locale }) {
  const ml = locale === 'ml';
  const name = (ml ? food.name_ml : food.name_en) || food.name_en;
  return (
    <Link href={`/${locale}/nutrition/${food.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-brand">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{CAT_ICON[food.category] || '🍽️'} {name}</h3>
          {food.name_en !== name && <p className="truncate text-xs text-gray-400">{food.name_en}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-brand">{food.calories_per_100g} kcal</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
        <span>P {food.protein_g}g</span><span>C {food.carbs_g}g</span><span>F {food.fat_g}g</span><span>Fibre {food.fiber_g}g</span>
        <span className="text-gray-400">/ 100g</span>
      </div>
    </Link>
  );
}

export default async function NutritionIndex(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const cur = { q: sp.q || '', category: sp.category || '', good: sp.good || '' };

  const foods = await listFoods({ q: cur.q, category: cur.category, goodFor: cur.good, page, limit: LIMIT });
  const base = `/${locale}/nutrition`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🥗 {ml ? 'പോഷകാഹാര ഡാറ്റാബേസ്' : 'Nutrition Database'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'കേരള ഭക്ഷണങ്ങളുടെ പോഷകമൂല്യവും ആരോഗ്യ ഗുണങ്ങളും' : 'Nutrition and health benefits of Kerala foods'}</p>
          <form action={base} className="mt-4">
            <input name="q" defaultValue={cur.q} placeholder={ml ? 'ഭക്ഷണം തിരയൂ…' : 'Search a food…'}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-brand focus:outline-none" />
          </form>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-5xl space-y-3 px-4">
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={qs(base, { q: cur.q, good: cur.good })} className={chip(!cur.category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {FOOD_CATEGORIES.map((c) => (
              <Link key={c.key} href={qs(base, { category: c.key, good: cur.good, q: cur.q })} className={chip(cur.category === c.key)}>{CAT_ICON[c.key]} {ml ? c.ml : c.en}</Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-xs font-semibold text-gray-500">{ml ? 'നല്ലത്:' : 'Good for:'}</span>
            {GOOD_FOR.map((g) => (
              <Link key={g.key} href={qs(base, { good: cur.good === g.key ? '' : g.key, category: cur.category, q: cur.q })} className={chip(cur.good === g.key)}>{ml ? g.ml : g.en}</Link>
            ))}
          </div>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {foods.length === 0 ? (
            <EmptyState title={ml ? 'ഭക്ഷണങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No foods found'} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {foods.map((f) => <FoodCard key={f.id} food={f} locale={locale} />)}
            </div>
          )}
          <div className="mt-6">
            <Pagination basePath={base} query={cur} page={page} hasNext={foods.length === LIMIT} locale={locale} />
          </div>
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml ? 'പോഷക മൂല്യങ്ങൾ ഏകദേശം (100g-ന്) — വിദ്യാഭ്യാസത്തിന് മാത്രം. വ്യക്തിഗത ഭക്ഷണക്രമത്തിന് ഡോക്ടറെയോ ഡയറ്റീഷ്യനെയോ സമീപിക്കുക.' : 'Nutrition values are approximate (per 100g) and for education only. For a personalised diet, consult a doctor or dietician.'}
          </p>
        </div>
      </FullBleed>
    </div>
  );
}
