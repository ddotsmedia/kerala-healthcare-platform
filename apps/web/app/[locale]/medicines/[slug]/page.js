// Medicine detail (SSR) — full information, Drug JSON-LD, NON-DISMISSABLE red
// disclaimer, Consult-a-Doctor CTA. Educational only, never prescriptive.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getMedicineBySlug } from '@/lib/medicines';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;
const arr = (ml, a, b) => { const v = (ml && a && a.length ? a : b) || []; return Array.isArray(v) ? v : []; };

const PREGNANCY = {
  A: ['A — സുരക്ഷിതം', 'A — Controlled studies show no risk'],
  B: ['B — സാധാരണ സുരക്ഷിതം', 'B — No evidence of risk in humans'],
  C: ['C — ജാഗ്രത', 'C — Risk cannot be ruled out'],
  D: ['D — അപകടസാധ്യത', 'D — Positive evidence of risk'],
  X: ['X — ഗർഭകാലത്ത് ഒഴിവാക്കുക', 'X — Contraindicated in pregnancy']
};

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const m = await getMedicineBySlug(slug);
  if (!m) return { title: 'Medicine · MalayaliDoctor' };
  const name = m.generic_name_en;
  return {
    title: `${name} — Uses, Side Effects, Dosage | MalayaliDoctor`.slice(0, 62),
    description: (pick(locale === 'ml', m.uses_ml, m.uses_en) || `${name} information`).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/medicines/${slug}` }
  };
}

function ListBlock({ title, items, tone = 'text-gray-700' }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-gray-900">{title}</h3>
      <ul className={`list-disc space-y-0.5 pl-5 text-sm ${tone}`}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
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

export default async function MedicineDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const m = await getMedicineBySlug(slug);
  if (!m) notFound();

  const name = pick(ml, m.generic_name_ml, m.generic_name_en);
  const brands = Array.isArray(m.brand_names) ? m.brand_names : [];
  const preg = m.pregnancy_category && PREGNANCY[m.pregnancy_category];
  const T = (mlT, enT) => (ml ? mlT : enT);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Drug',
    name: m.generic_name_en,
    alternateName: brands,
    drugClass: m.drug_class || undefined,
    activeIngredient: m.generic_name_en,
    dosageForm: Array.isArray(m.dosage_forms) ? m.dosage_forms.join(', ') : undefined,
    indication: m.uses_en || undefined,
    mechanismOfAction: m.mechanism_en || undefined,
    pregnancyCategory: m.pregnancy_category || undefined,
    nonProprietaryName: m.generic_name_en,
    url: `${SITE}/${locale}/medicines/${slug}`
  };

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/medicines`} className="hover:text-brand">{ml ? 'മരുന്നുകൾ' : 'Medicines'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      {/* MANDATORY non-dismissable red disclaimer */}
      <div role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
        <span className="font-bold">⚠️ {ml ? 'പ്രധാനം: ' : 'Important: '}</span>
        {ml
          ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രമാണ്. ഡോക്ടറുടെ ഉപദേശമില്ലാതെ ഒരു മരുന്നും ആരംഭിക്കുകയോ നിർത്തുകയോ മാറ്റുകയോ ചെയ്യരുത്. ഇത് ഒരു കുറിപ്പടിയല്ല.'
          : 'This information is for education only. Never start, stop, or change any medication without consulting your doctor. This is NOT a prescription.'}
      </div>

      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m.is_otc ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {m.is_otc ? (ml ? 'ഓവർ-ദ-കൌണ്ടർ (OTC)' : 'Over-the-counter (OTC)') : (ml ? 'കുറിപ്പടി ആവശ്യം' : 'Prescription only')}
          </span>
          {m.drug_class && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{m.drug_class}</span>}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
        {m.generic_name_en !== name && <p className="text-sm text-gray-500">{m.generic_name_en}</p>}
      </header>

      {brands.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-1 text-sm font-bold text-gray-900">{ml ? 'ബ്രാൻഡ് പേരുകൾ' : 'Brand names'}</h3>
          <div className="flex flex-wrap gap-1.5">
            {brands.map((b) => <span key={b} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{b}</span>)}
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <TextBlock title={T('ഉപയോഗങ്ങൾ', 'Uses')} body={pick(ml, m.uses_ml, m.uses_en)} />
        <TextBlock title={T('എങ്ങനെ പ്രവർത്തിക്കുന്നു', 'How it works')} body={pick(ml, m.mechanism_ml, m.mechanism_en)} />
        <ListBlock title={T('സാധാരണ പാർശ്വഫലങ്ങൾ', 'Common side effects')} items={arr(ml, m.common_side_effects_ml, m.common_side_effects_en)} />
        <ListBlock title={T('ഗുരുതരമായ പാർശ്വഫലങ്ങൾ', 'Serious side effects')} items={arr(ml, m.serious_side_effects_ml, m.serious_side_effects_en)} tone="text-red-700" />
        <TextBlock title={T('ആർക്കൊക്കെ ഒഴിവാക്കണം', 'Who should not take it')} body={pick(ml, m.contraindications_ml, m.contraindications_en)} />
        <TextBlock title={T('മറ്റ് മരുന്നുകളുമായുള്ള ഇടപെടൽ', 'Drug interactions')} body={pick(ml, m.interactions_ml, m.interactions_en)} />
        <TextBlock title={T('സൂക്ഷിക്കേണ്ട വിധം', 'Storage')} body={pick(ml, m.storage_ml, m.storage_en)} />
        {preg && (
          <div>
            <h3 className="mb-1 text-sm font-bold text-gray-900">{ml ? 'ഗർഭകാല വിഭാഗം' : 'Pregnancy category'}</h3>
            <p className="text-sm text-gray-700">{ml ? preg[0] : preg[1]}</p>
          </div>
        )}
      </section>

      {Array.isArray(m.references) && m.references.length > 0 && (
        <p className="text-xs text-gray-400">{ml ? 'സ്രോതസ്സുകൾ: ' : 'Sources: '}{m.references.join(' · ')}</p>
      )}

      <div className="rounded-2xl bg-brand p-5 text-center text-white">
        <h2 className="text-lg font-bold">{ml ? 'ഈ മരുന്നിനെക്കുറിച്ച് സംശയമുണ്ടോ?' : 'Questions about this medicine?'}</h2>
        <p className="mt-1 text-sm text-white/90">{ml ? 'യോഗ്യതയുള്ള ഡോക്ടറുമായി സംസാരിക്കൂ.' : 'Talk to a qualified doctor.'}</p>
        <Link href={`/${locale}/doctors`} className="mt-3 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-gray-100">
          👨‍⚕️ {ml ? 'ഡോക്ടറെ സമീപിക്കൂ' : 'Consult a Doctor'}
        </Link>
      </div>
    </main>
  );
}
