// Procedure detail (SSR) — what-to-expect guide, CSS timeline (Before → During →
// Recovery → Follow-up), cost range with disclaimer, MedicalProcedure JSON-LD,
// related specialists + hospitals. Educational only.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getProcedureBySlug } from '@/lib/procedures';
import { searchDoctors, searchHospitals } from '@/lib/providers';
import { DoctorCard, HospitalCard } from '@khp/ui';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;

function duration(min, max, ml) {
  if (!min && !max) return null;
  if (min && max && min !== max) return `${min}–${max} ${ml ? 'മിനിറ്റ്' : 'min'}`;
  return `${max || min} ${ml ? 'മിനിറ്റ്' : 'min'}`;
}
function stay(min, max, ml) {
  if (!max || max === 0) return ml ? 'ഡേ-കെയർ (ആശുപത്രിവാസം വേണ്ട)' : 'Day-care (no overnight stay)';
  if (min === max) return ml ? `${max} ദിവസം` : `${max} day${max > 1 ? 's' : ''}`;
  return ml ? `${min}–${max} ദിവസം` : `${min}–${max} days`;
}
const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const p = await getProcedureBySlug(slug);
  if (!p) return { title: 'Procedure · MalayaliDoctor' };
  const name = p.name_en;
  return {
    title: `${name} — What to Expect, Recovery | MalayaliDoctor`.slice(0, 62),
    description: (pick(locale === 'ml', p.description_ml, p.description_en) || name).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/procedures/${slug}` }
  };
}

function TimelineStep({ n, icon, title, body }) {
  if (!body) return null;
  return (
    <li className="relative pl-10">
      <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm text-white">{icon}</span>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-0.5 text-sm leading-relaxed text-gray-700">{body}</p>
    </li>
  );
}

export default async function ProcedureDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const p = await getProcedureBySlug(slug);
  if (!p) notFound();

  const [doctors, hospitals] = await Promise.all([
    p.specialty_id ? searchDoctors({ specialtyId: p.specialty_id, page: 1, limit: 3 }) : Promise.resolve([]),
    searchHospitals({ page: 1, limit: 2 })
  ]);

  const name = pick(ml, p.name_ml, p.name_en);
  const specialty = pick(ml, p.specialty_ml, p.specialty_en);
  const T = (mlT, enT) => (ml ? mlT : enT);
  const dur = duration(p.duration_minutes_min, p.duration_minutes_max, ml);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'MedicalProcedure',
    name: p.name_en,
    description: p.description_en || undefined,
    howPerformed: p.what_happens_en || undefined,
    preparation: p.preparation_en || undefined,
    bodyLocation: undefined,
    followup: p.recovery_en || undefined,
    procedureType: p.category || undefined,
    url: `${SITE}/${locale}/procedures/${slug}`
  };

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/procedures`} className="hover:text-brand">{ml ? 'നടപടിക്രമങ്ങൾ' : 'Procedures'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {p.category && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{p.category}</span>}
          {specialty && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{specialty}</span>}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
        {p.name_en !== name && <p className="text-sm text-gray-500">{p.name_en}</p>}
        {pick(ml, p.description_ml, p.description_en) && <p className="text-sm leading-relaxed text-gray-700">{pick(ml, p.description_ml, p.description_en)}</p>}
      </header>

      {/* Quick facts */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {dur && <div className="rounded-xl border border-gray-200 bg-white p-3 text-center"><div className="text-xs text-gray-500">{ml ? 'ദൈർഘ്യം' : 'Duration'}</div><div className="text-sm font-bold text-gray-900">{dur}</div></div>}
        {p.anaesthesia_type && <div className="rounded-xl border border-gray-200 bg-white p-3 text-center"><div className="text-xs text-gray-500">{ml ? 'അനസ്തേഷ്യ' : 'Anaesthesia'}</div><div className="text-sm font-bold capitalize text-gray-900">{p.anaesthesia_type}</div></div>}
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center"><div className="text-xs text-gray-500">{ml ? 'ആശുപത്രിവാസം' : 'Hospital stay'}</div><div className="text-sm font-bold text-gray-900">{stay(p.hospital_stay_days_min, p.hospital_stay_days_max, ml)}</div></div>
      </section>

      {pick(ml, p.why_performed_ml, p.why_performed_en) && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-bold text-gray-900">{ml ? 'എന്തിന് ചെയ്യുന്നു' : 'Why it is performed'}</h2>
          <p className="text-sm leading-relaxed text-gray-700">{pick(ml, p.why_performed_ml, p.why_performed_en)}</p>
        </section>
      )}

      {/* CSS-only timeline */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-gray-900">{ml ? 'ഘട്ടം ഘട്ടമായി' : 'Step by step'}</h2>
        <ol className="space-y-4 border-l-2 border-teal-100 pl-1">
          <TimelineStep n={1} icon="📋" title={T('മുമ്പ് — തയ്യാറെടുപ്പ്', 'Before — Preparation')} body={pick(ml, p.preparation_ml, p.preparation_en)} />
          <TimelineStep n={2} icon="🏥" title={T('സമയത്ത് — എന്ത് സംഭവിക്കുന്നു', 'During — What happens')} body={pick(ml, p.what_happens_ml, p.what_happens_en)} />
          <TimelineStep n={3} icon="🌿" title={T('ശേഷം — സുഖം പ്രാപിക്കൽ', 'Recovery')} body={pick(ml, p.recovery_ml, p.recovery_en)} />
          <TimelineStep n={4} icon="🔁" title={T('തുടർ പരിചരണം', 'Follow-up')} body={pick(ml, p.risks_ml, p.risks_en) ? `${T('സാധ്യമായ അപകടസാധ്യതകൾ: ', 'Possible risks: ')}${pick(ml, p.risks_ml, p.risks_en)}` : T('ഡോക്ടർ നിർദ്ദേശിക്കുന്ന തുടർ പരിശോധനകൾ.', 'Follow-up visits as advised by your doctor.')} />
        </ol>
      </section>

      {/* Cost range with disclaimer */}
      {(p.cost_range_min || p.cost_range_max) && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-bold text-gray-900">{ml ? 'ഏകദേശ ചെലവ്' : 'Approximate cost'}</h2>
          <p className="mt-1 text-lg font-extrabold text-brand">
            {p.cost_range_min && p.cost_range_max ? `${inr(p.cost_range_min)} – ${inr(p.cost_range_max)}` : inr(p.cost_range_min || p.cost_range_max)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {ml
              ? 'ഇത് ഒരു ഏകദേശ സൂചക ശ്രേണി മാത്രമാണ് — ഒരു ക്വട്ടേഷനല്ല. യഥാർത്ഥ ചെലവ് ആശുപത്രി, നഗരം, രോഗാവസ്ഥ എന്നിവ അനുസരിച്ച് വ്യത്യാസപ്പെടും.'
              : 'This is an approximate indicative range only — not a quotation. Actual cost varies by hospital, city and individual case.'}
          </p>
        </section>
      )}

      {/* NON-DISMISSABLE educational note */}
      <div role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
        <span className="font-bold">⚠️ {ml ? 'പ്രധാനം: ' : 'Important: '}</span>
        {ml
          ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രം — ചികിത്സാ ഉപദേശമോ ശുപാർശയോ അല്ല. നിങ്ങളുടെ നടപടിക്രമം, അപകടസാധ്യതകൾ, ചെലവ് എന്നിവയെക്കുറിച്ച് യോഗ്യതയുള്ള ഡോക്ടറുമായി സംസാരിക്കുക.'
          : 'This information is for education only — not medical advice or a recommendation. Discuss your specific procedure, its risks and cost with a qualified doctor.'}
      </div>

      {doctors.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{specialty ? (ml ? `${specialty} വിദഗ്ധർ` : `${specialty} specialists`) : (ml ? 'വിദഗ്ധർ' : 'Specialists')}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
        </section>
      )}

      {hospitals.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ആശുപത്രികൾ' : 'Hospitals'}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {hospitals.map((h) => <HospitalCard key={h.id} hospital={h} locale={locale} />)}
          </div>
          <Link href={`/${locale}/hospitals`} className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">{ml ? 'എല്ലാ ആശുപത്രികളും →' : 'See all hospitals →'}</Link>
        </section>
      )}
    </main>
  );
}
