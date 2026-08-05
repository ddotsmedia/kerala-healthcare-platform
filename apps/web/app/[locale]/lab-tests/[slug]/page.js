// Lab-test detail (SSR) — sections, normal-ranges table (JSONB), MedicalTest
// JSON-LD, non-dismissable disclaimer, Find-a-Lab CTA. Educational only.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getLabTestBySlug } from '@/lib/labTests';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;
const titleCase = (s) => String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const t = await getLabTestBySlug(slug);
  if (!t) return { title: 'Lab Test · MalayaliDoctor' };
  const name = t.name_en;
  return {
    title: `${name} Test — Normal Range, Preparation | MalayaliDoctor`.slice(0, 62),
    description: (pick(locale === 'ml', t.description_ml, t.description_en) || `${name} test`).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/lab-tests/${slug}` }
  };
}

function TextBlock({ title, body }) {
  if (!body) return null;
  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  );
}

/** Render the normal_ranges JSONB as a table. Values may be {min,max,unit} or scalar. */
function RangesTable({ ranges, ml }) {
  if (!ranges || typeof ranges !== 'object') return null;
  const rows = Object.entries(ranges);
  if (rows.length === 0) return null;
  const fmt = (v) => {
    if (v == null) return '—';
    if (typeof v !== 'object') return String(v);
    const parts = [];
    if (v.min != null && v.max != null) parts.push(`${v.min} – ${v.max}`);
    else if (v.min != null) parts.push(`≥ ${v.min}`);
    else if (v.max != null) parts.push(`≤ ${v.max}`);
    return `${parts.join('')}${v.unit ? ` ${v.unit}` : ''}` || (v.unit || '—');
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{ml ? 'വിഭാഗം' : 'Group'}</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{ml ? 'സാധാരണ പരിധി' : 'Normal range'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="px-3 py-2 font-medium text-gray-800">{titleCase(k)}</td>
              <td className="px-3 py-2 text-gray-700">{fmt(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function LabTestDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const t = await getLabTestBySlug(slug);
  if (!t) notFound();

  const name = pick(ml, t.name_ml, t.name_en);
  const conditions = Array.isArray(t.related_conditions) ? t.related_conditions : [];
  const relTests = Array.isArray(t.related_tests) ? t.related_tests : [];
  const T = (mlT, enT) => (ml ? mlT : enT);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'MedicalTest',
    name: t.name_en,
    alternateName: t.abbreviation || undefined,
    description: t.description_en || undefined,
    usedToDiagnose: conditions.length ? conditions.map((c) => ({ '@type': 'MedicalCondition', name: c })) : undefined,
    url: `${SITE}/${locale}/lab-tests/${slug}`
  };

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/lab-tests`} className="hover:text-brand">{ml ? 'ലാബ് ടെസ്റ്റുകൾ' : 'Lab Tests'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {t.abbreviation && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">{t.abbreviation}</span>}
          {t.category && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{t.category}</span>}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
        {t.name_en !== name && <p className="text-sm text-gray-500">{t.name_en}</p>}
        {pick(ml, t.description_ml, t.description_en) && <p className="text-sm leading-relaxed text-gray-700">{pick(ml, t.description_ml, t.description_en)}</p>}
      </header>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <TextBlock title={T('എന്ത് അളക്കുന്നു', 'What it measures')} body={pick(ml, t.what_it_measures_ml, t.what_it_measures_en)} />
        <TextBlock title={T('എന്തിന് നിർദ്ദേശിക്കുന്നു', 'Why it is ordered')} body={pick(ml, t.why_ordered_ml, t.why_ordered_en)} />
        <TextBlock title={T('എങ്ങനെ തയ്യാറെടുക്കണം', 'How to prepare')} body={pick(ml, t.preparation_ml, t.preparation_en)} />
        <TextBlock title={T('എന്ത് സംഭവിക്കുന്നു', 'What happens during the test')} body={pick(ml, t.procedure_ml, t.procedure_en)} />
        {t.normal_ranges && (
          <div>
            <h3 className="mb-1 text-sm font-bold text-gray-900">{ml ? 'സാധാരണ പരിധികൾ' : 'Normal ranges'}</h3>
            <RangesTable ranges={t.normal_ranges} ml={ml} />
            <p className="mt-1 text-xs text-gray-400">{ml ? 'പരിധികൾ ലാബ് അനുസരിച്ച് അല്പം വ്യത്യാസപ്പെടാം.' : 'Ranges vary slightly between laboratories.'}</p>
          </div>
        )}
        <TextBlock title={T('അസാധാരണ ഫലങ്ങൾ എന്ത് സൂചിപ്പിക്കാം', 'What abnormal results may mean')} body={pick(ml, t.abnormal_interpretation_ml, t.abnormal_interpretation_en)} />
      </section>

      {(conditions.length > 0 || relTests.length > 0) && (
        <section className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 text-sm">
          {conditions.length > 0 && <p><span className="font-semibold text-gray-900">{ml ? 'ബന്ധപ്പെട്ട അവസ്ഥകൾ: ' : 'Related conditions: '}</span><span className="text-gray-700">{conditions.join(', ')}</span></p>}
          {relTests.length > 0 && <p><span className="font-semibold text-gray-900">{ml ? 'അനുബന്ധ ടെസ്റ്റുകൾ: ' : 'Related tests: '}</span><span className="text-gray-700">{relTests.join(', ')}</span></p>}
        </section>
      )}

      {/* NON-DISMISSABLE disclaimer */}
      <div role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
        <span className="font-bold">⚠️ {ml ? 'പ്രധാനം: ' : 'Important: '}</span>
        {ml
          ? 'അസാധാരണമായ ഫലങ്ങൾ നിങ്ങൾക്ക് ഒരു രോഗമുണ്ടെന്ന് അർത്ഥമാക്കുന്നില്ല. എപ്പോഴും നിങ്ങളുടെ ഫലങ്ങൾ ഡോക്ടറുമായി ചർച്ച ചെയ്യുക.'
          : 'Abnormal results do not mean you have a disease. Always discuss your results with your doctor.'}
      </div>

      <div className="rounded-2xl bg-brand p-5 text-center text-white">
        <h2 className="text-lg font-bold">{ml ? 'ഈ ടെസ്റ്റ് ചെയ്യണോ?' : 'Need to get this test done?'}</h2>
        <Link href={`/${locale}/labs`} className="mt-3 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-gray-100">
          🔬 {ml ? 'ലാബ് കണ്ടെത്തൂ' : 'Find a Lab'}
        </Link>
      </div>
    </main>
  );
}
