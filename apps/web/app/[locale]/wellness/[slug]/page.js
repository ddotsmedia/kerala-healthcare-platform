// Wellness article detail (SSR) — body content + mandatory exercise disclaimer.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getWellness } from '@/lib/wellness';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const w = await getWellness(slug);
  if (!w) return { title: 'Wellness · MalayaliDoctor' };
  const ml = locale === 'ml';
  const title = pick(ml, w.title_ml, w.title_en);
  return {
    title: `${title} | MalayaliDoctor`.slice(0, 62),
    description: (pick(ml, w.excerpt_ml, w.excerpt_en) || title).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/wellness/${slug}` }
  };
}

export default async function WellnessDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const w = await getWellness(slug);
  if (!w) notFound();

  const title = pick(ml, w.title_ml, w.title_en);
  const body = pick(ml, w.body_ml, w.body_en);
  const cat = w.categories && w.categories[0];

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/wellness`} className="hover:text-brand">{ml ? 'വെൽനെസ്' : 'Wellness'}</Link> › <span className="text-gray-700">{title}</span>
      </nav>

      <header className="space-y-1">
        {cat && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{ml ? cat.name_ml : cat.name_en}</span>}
        <h1 className="text-2xl font-extrabold text-gray-900">🧘 {title}</h1>
        {pick(ml, w.excerpt_ml, w.excerpt_en) && <p className="text-sm leading-relaxed text-gray-700">{pick(ml, w.excerpt_ml, w.excerpt_en)}</p>}
      </header>

      {body && (
        <section className="prose prose-sm max-w-none text-gray-700 [&_li]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: body }} />
      )}

      <div role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
        <span className="font-bold">⚠️ {ml ? 'പ്രധാനം: ' : 'Important: '}</span>
        {ml
          ? 'ഏതെങ്കിലും വ്യായാമ പരിപാടി ആരംഭിക്കുന്നതിന് മുമ്പ്, പ്രത്യേകിച്ച് ആരോഗ്യപ്രശ്നമുണ്ടെങ്കിൽ, ഡോക്ടറെ സമീപിക്കുക.'
          : 'Consult your doctor before starting any exercise program, especially if you have a medical condition.'}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/${locale}/wellness`} className="text-sm font-semibold text-brand hover:underline">← {ml ? 'എല്ലാ വെൽനെസ് ലേഖനങ്ങളും' : 'All wellness'}</Link>
        <Link href={`/${locale}/doctors?specialty=`} className="text-sm font-semibold text-brand hover:underline">{ml ? 'ആയുഷ് ഡോക്ടർമാരെ കാണൂ →' : 'Find AYUSH doctors →'}</Link>
      </div>
    </main>
  );
}
