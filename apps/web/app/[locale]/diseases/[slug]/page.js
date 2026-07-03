// Disease detail — structured sections, quick-nav, MedicalCondition JSON-LD.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getPublishedContent } from '@/lib/knowledge';
import { medicalWebPageSchema, SITE } from '@/lib/schema';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const c = await getPublishedContent(params.slug);
  return { title: c ? `${locale === 'ml' ? (c.title_ml || c.title_en) : c.title_en} · ${t(locale, 'diseases')}` : t(locale, 'diseases') };
}

export default async function DiseaseDetail(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const c = await getPublishedContent(params.slug);
  if (!c || c.type !== 'disease') notFound();
  const d = c.disease || {};
  const title = ml ? (c.title_ml || c.title_en) : c.title_en;
  const overview = (ml ? (c.body_ml || c.body_en) : c.body_en) || (ml ? c.excerpt_ml : c.excerpt_en) || '';
  const url = `${SITE}/${locale}/diseases/${c.slug}`;

  const L = (mlArr, enArr) => (ml ? mlArr : enArr) || [];
  const T = (mlv, env) => (ml ? mlv : env) || '';

  const sections = [
    { id: 'overview', icon: '📋', label: ml ? 'അവലോകനം' : 'Overview', kind: 'text', text: overview },
    { id: 'symptoms', icon: '🤒', label: ml ? 'ലക്ഷണങ്ങൾ' : 'Symptoms', kind: 'list', items: L(d.symptoms_ml, d.symptoms_en) },
    { id: 'causes', icon: '⚠️', label: ml ? 'കാരണങ്ങൾ' : 'Causes', kind: 'list', items: L(d.causes_ml, d.causes_en) },
    { id: 'risk', icon: '🚨', label: ml ? 'അപകടസാധ്യതകൾ' : 'Risk Factors', kind: 'list', items: L(d.risk_factors_ml, d.risk_factors_en) },
    { id: 'diagnosis', icon: '🔬', label: ml ? 'രോഗനിർണയം' : 'Diagnosis', kind: 'text', text: T(d.diagnosis_ml, d.diagnosis_en) },
    { id: 'treatment', icon: '💊', label: ml ? 'ചികിത്സ' : 'Treatment', kind: 'text', text: T(d.treatment_ml, d.treatment_en) },
    { id: 'prevention', icon: '🌿', label: ml ? 'പ്രതിരോധം' : 'Prevention', kind: 'text', text: T(d.prevention_ml, d.prevention_en) }
  ].filter((s) => (s.kind === 'list' ? s.items.length : s.text));
  const emergency = L(d.emergency_signs_ml, d.emergency_signs_en);

  const ld = [
    medicalWebPageSchema(title, (ml ? c.excerpt_ml : c.excerpt_en) || '', url),
    {
      '@context': 'https://schema.org', '@type': 'MedicalCondition', name: title,
      signOrSymptom: (d.symptoms_en && d.symptoms_en.length) ? d.symptoms_en : undefined,
      cause: d.causes_en || undefined, riskFactor: d.risk_factors_en || undefined,
      possibleTreatment: d.treatment_en || undefined
    }
  ];

  return (
    <article className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <KnowledgeDisclaimer locale={locale} />
      <p className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">{t(locale, 'not_diagnosis')}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900"><span aria-hidden="true">{s.icon}</span> {s.label}</h2>
              {s.kind === 'list'
                ? <ul className="ml-5 list-disc space-y-1 text-sm text-gray-800">{s.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
                : <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{s.text}</p>}
            </section>
          ))}
          {emergency.length > 0 && (
            <section id="emergency" className="scroll-mt-20 rounded-2xl border-l-4 border-red-500 bg-red-50 p-5">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-red-800"><span aria-hidden="true">🆘</span> {ml ? 'അടിയന്തര ലക്ഷണങ്ങൾ — 112 / 108' : 'Emergency signs — call 112 / 108'}</h2>
              <ul className="ml-5 list-disc space-y-1 text-sm text-red-800">{emergency.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <nav className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">{ml ? 'വിഭാഗങ്ങൾ' : 'Sections'}</h3>
              <ul className="space-y-1 text-sm">
                {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-brand hover:underline">{s.icon} {s.label}</a></li>)}
                {emergency.length > 0 && <li><a href="#emergency" className="font-semibold text-red-600 hover:underline">🆘 {ml ? 'അടിയന്തരം' : 'Emergency'}</a></li>}
              </ul>
            </nav>
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
              <div className="font-semibold">{ml ? 'അടിയന്തര നമ്പറുകൾ' : 'Emergency'}</div>
              <a href="tel:112" className="mt-1 block font-bold">112</a>
              <a href="tel:108" className="block font-bold">108 {ml ? '(ആംബുലൻസ്)' : '(Ambulance)'}</a>
            </div>
            {c.specialties && c.specialties.length > 0 && (
              <Link href={`/${locale}/specialties/${c.specialties[0].slug}`} className="block rounded-2xl bg-brand p-4 text-center text-sm font-semibold text-white hover:bg-brand-dark">
                {ml ? 'വിദഗ്ധരെ കാണുക →' : 'See specialists →'}
              </Link>
            )}
          </div>
        </aside>
      </div>

      <Link href={`/${locale}/doctors`} className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {t(locale, 'find_a_doctor')}
      </Link>
    </article>
  );
}
