// Food detail (SSR) — nutrition table, key nutrients, benefits, good/caution for.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getFoodBySlug, GOOD_FOR } from '@/lib/nutrition';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;
const label = (key) => { const g = GOOD_FOR.find((x) => x.key === key); return g ? g.en : key.replace(/_/g, ' '); };
const labelMl = (key) => { const g = GOOD_FOR.find((x) => x.key === key); return g ? g.ml : key.replace(/_/g, ' '); };

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const f = await getFoodBySlug(slug);
  if (!f) return { title: 'Food · MalayaliDoctor' };
  const name = f.name_en;
  return {
    title: `${name} — Nutrition, Calories & Benefits | MalayaliDoctor`.slice(0, 62),
    description: (pick(locale === 'ml', f.health_benefits_ml, f.health_benefits_en) || `${name} nutrition`).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/nutrition/${slug}` }
  };
}

function Macro({ label, value, unit }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
      <div className="text-lg font-extrabold text-brand">{value}{unit}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function FoodDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const f = await getFoodBySlug(slug);
  if (!f) notFound();

  const name = pick(ml, f.name_ml, f.name_en);
  const benefits = pick(ml, f.health_benefits_ml, f.health_benefits_en);
  const nutrients = Array.isArray(f.key_nutrients) ? f.key_nutrients : [];
  const goodFor = Array.isArray(f.good_for) ? f.good_for : [];
  const cautionFor = Array.isArray(f.caution_for) ? f.caution_for : [];

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'NutritionInformation',
    calories: `${f.calories_per_100g} kcal`,
    proteinContent: `${f.protein_g} g`, carbohydrateContent: `${f.carbs_g} g`,
    fatContent: `${f.fat_g} g`, fiberContent: `${f.fiber_g} g`
  };

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/nutrition`} className="hover:text-brand">{ml ? 'പോഷകാഹാരം' : 'Nutrition'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="space-y-1">
        {f.category && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{f.category}</span>}
        <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
        {f.name_en !== name && <p className="text-sm text-gray-500">{f.name_en}</p>}
      </header>

      <section>
        <h2 className="mb-2 text-sm font-bold text-gray-900">{ml ? 'പോഷക വിവരം (100g)' : 'Nutrition (per 100g)'}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <Macro label={ml ? 'കലോറി' : 'Calories'} value={f.calories_per_100g} unit="" />
          <Macro label={ml ? 'പ്രോട്ടീൻ' : 'Protein'} value={f.protein_g} unit="g" />
          <Macro label={ml ? 'കാർബ്സ്' : 'Carbs'} value={f.carbs_g} unit="g" />
          <Macro label={ml ? 'കൊഴുപ്പ്' : 'Fat'} value={f.fat_g} unit="g" />
          <Macro label={ml ? 'നാര്' : 'Fibre'} value={f.fiber_g} unit="g" />
        </div>
      </section>

      {nutrients.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-bold text-gray-900">{ml ? 'പ്രധാന പോഷകങ്ങൾ' : 'Key nutrients'}</h2>
          <div className="flex flex-wrap gap-1.5">
            {nutrients.map((n) => <span key={n} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{n}</span>)}
          </div>
        </section>
      )}

      {benefits && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-bold text-gray-900">{ml ? 'ആരോഗ്യ ഗുണങ്ങൾ' : 'Health benefits'}</h2>
          <p className="text-sm leading-relaxed text-gray-700">{benefits}</p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {goodFor.length > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h2 className="mb-1 text-sm font-bold text-green-800">✅ {ml ? 'നല്ലത്' : 'Good for'}</h2>
            <div className="flex flex-wrap gap-1.5">{goodFor.map((g) => <span key={g} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-green-700">{ml ? labelMl(g) : label(g)}</span>)}</div>
          </div>
        )}
        {cautionFor.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="mb-1 text-sm font-bold text-amber-800">⚠️ {ml ? 'ജാഗ്രത' : 'Caution for'}</h2>
            <div className="flex flex-wrap gap-1.5">{cautionFor.map((g) => <span key={g} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-amber-700">{ml ? labelMl(g) : label(g)}</span>)}</div>
          </div>
        )}
      </section>

      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml
          ? 'പോഷക മൂല്യങ്ങൾ ഏകദേശം (100g-ന്) മാത്രം. ഇത് വൈദ്യോപദേശമല്ല — വ്യക്തിഗത ഭക്ഷണക്രമത്തിന് ഡോക്ടറെയോ ഡയറ്റീഷ്യനെയോ സമീപിക്കുക.'
          : 'Nutrition values are approximate (per 100g). This is not medical advice — for a personalised diet consult a doctor or dietician.'}
      </div>

      <Link href={`/${locale}/nutrition`} className="inline-block text-sm font-semibold text-brand hover:underline">← {ml ? 'എല്ലാ ഭക്ഷണങ്ങളും' : 'All foods'}</Link>
    </main>
  );
}
