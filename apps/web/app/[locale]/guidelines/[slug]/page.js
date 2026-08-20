// Guideline detail (SSR) — simplified summary with PROMINENT source citation
// and a "refer to the original guideline for clinical use" disclaimer.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getGuideline } from '@/lib/guidelines';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const g = await getGuideline(slug);
  if (!g) return { title: 'Guideline · MalayaliDoctor' };
  const ml = locale === 'ml';
  const title = pick(ml, g.title_ml, g.title_en);
  return {
    title: `${title} | MalayaliDoctor`.slice(0, 62),
    description: (pick(ml, g.excerpt_ml, g.excerpt_en) || title).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/guidelines/${slug}` }
  };
}

export default async function GuidelineDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const g = await getGuideline(slug);
  if (!g) notFound();

  const title = pick(ml, g.title_ml, g.title_en);
  const body = pick(ml, g.body_ml, g.body_en);

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/guidelines`} className="hover:text-brand">{ml ? 'മാർഗരേഖകൾ' : 'Guidelines'}</Link> › <span className="text-gray-700">{title}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">📋 {title}</h1>
        {pick(ml, g.excerpt_ml, g.excerpt_en) && <p className="text-sm leading-relaxed text-gray-700">{pick(ml, g.excerpt_ml, g.excerpt_en)}</p>}
      </header>

      {/* PROMINENT source citation */}
      {g.source_org && (
        <div className="rounded-xl border-2 border-brand bg-teal-50 px-4 py-3">
          <p className="text-sm font-bold text-brand">
            {ml ? '📚 സ്രോതസ്സ്: ' : '📚 Source: '}{g.source_org}
          </p>
          {g.source_url && (
            <a href={g.source_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand underline">
              {ml ? 'ഔദ്യോഗിക മാർഗരേഖ →' : 'Official guideline →'}
            </a>
          )}
        </div>
      )}

      {body && (
        <section className="prose prose-sm max-w-none text-gray-700 [&_li]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: body }} />
      )}

      <div role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
        <span className="font-bold">⚠️ {ml ? 'പ്രധാനം: ' : 'Important: '}</span>
        {ml
          ? 'ഇത് ഒരു ലളിതമാക്കിയ സംഗ്രഹമാണ്. ക്ലിനിക്കൽ ഉപയോഗത്തിന് യഥാർത്ഥ മാർഗരേഖ പരിശോധിക്കുക. വ്യക്തിഗത ചികിത്സയ്ക്ക് ഡോക്ടറെ സമീപിക്കുക.'
          : 'This is a simplified summary. Refer to the original guideline for clinical use. Consult a doctor for individual care.'}
      </div>

      <Link href={`/${locale}/guidelines`} className="inline-block text-sm font-semibold text-brand hover:underline">← {ml ? 'എല്ലാ മാർഗരേഖകളും' : 'All guidelines'}</Link>
    </main>
  );
}
