// Disease detail — structured sections. MedicalWebPage JSON-LD + disclaimer.
// Educational only; emergency signs surface 112/108.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getPublishedContent } from '@/lib/knowledge';
import { medicalWebPageSchema, SITE } from '@/lib/schema';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  const c = await getPublishedContent(params.slug);
  return { title: c ? `${locale === 'ml' ? (c.title_ml || c.title_en) : c.title_en} · ${t(locale, 'diseases')}` : t(locale, 'diseases') };
}

function List({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-1 text-sm font-semibold text-gray-700">{label}</h2>
      <ul className="list-inside list-disc text-sm text-gray-800">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </section>
  );
}

export default async function DiseaseDetail({ params }) {
  const locale = resolveLocale(params.locale);
  const c = await getPublishedContent(params.slug);
  if (!c || c.type !== 'disease') notFound();
  const d = c.disease || {};
  const ml = locale === 'ml';
  const title = ml ? (c.title_ml || c.title_en) : c.title_en;
  const url = `${SITE}/${locale}/diseases/${c.slug}`;
  const ld = medicalWebPageSchema(title, (ml ? c.excerpt_ml : c.excerpt_en) || '', url);

  return (
    <article className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <KnowledgeDisclaimer locale={locale} />
      <p className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">{t(locale, 'not_diagnosis')}</p>

      <List label={t(locale, 'symptoms')} items={ml ? d.symptoms_ml : d.symptoms_en} />
      <List label={ml ? 'കാരണങ്ങൾ' : 'Causes'} items={ml ? d.causes_ml : d.causes_en} />
      <List label={ml ? 'അപകടസാധ്യതകൾ' : 'Risk factors'} items={ml ? d.risk_factors_ml : d.risk_factors_en} />

      {(ml ? d.treatment_ml : d.treatment_en) && (
        <section><h2 className="mb-1 text-sm font-semibold text-gray-700">{ml ? 'ചികിത്സ' : 'Treatment'}</h2>
          <p className="text-sm text-gray-800">{ml ? d.treatment_ml : d.treatment_en}</p></section>
      )}
      {(ml ? d.prevention_ml : d.prevention_en) && (
        <section><h2 className="mb-1 text-sm font-semibold text-gray-700">{ml ? 'പ്രതിരോധം' : 'Prevention'}</h2>
          <p className="text-sm text-gray-800">{ml ? d.prevention_ml : d.prevention_en}</p></section>
      )}

      {((ml ? d.emergency_signs_ml : d.emergency_signs_en) || []).length > 0 && (
        <section className="rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3">
          <h2 className="mb-1 text-sm font-semibold text-red-800">{ml ? 'അടിയന്തര ലക്ഷണങ്ങൾ — 112 / 108' : 'Emergency signs — call 112 / 108'}</h2>
          <ul className="list-inside list-disc text-sm text-red-800">
            {(ml ? d.emergency_signs_ml : d.emergency_signs_en).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </section>
      )}

      <Link href={`/${locale}/doctors`} className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {t(locale, 'find_a_doctor')}
      </Link>
    </article>
  );
}
