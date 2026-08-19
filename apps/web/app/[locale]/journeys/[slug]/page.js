// Journey detail (SSR) — step-by-step CSS timeline with per-step duration + tips,
// related specialists + hospitals, patient-stories placeholder. Educational only.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getJourney, journeyDoctors, sortedSteps } from '@/lib/journeys';
import { searchHospitals } from '@/lib/providers';
import { DoctorCard, HospitalCard } from '@khp/ui';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const j = await getJourney(slug);
  if (!j) return { title: 'Journey · MalayaliDoctor' };
  const ml = locale === 'ml';
  const title = pick(ml, j.meta_title_ml, j.meta_title_en) || pick(ml, j.title_ml, j.title_en);
  return {
    title: `${title} | MalayaliDoctor`.slice(0, 62),
    description: (pick(ml, j.meta_desc_ml, j.meta_desc_en) || pick(ml, j.excerpt_ml, j.excerpt_en) || title).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/journeys/${slug}` }
  };
}

function Step({ step, locale, last }) {
  const ml = locale === 'ml';
  const title = pick(ml, step.title_ml, step.title_en);
  const desc = pick(ml, step.description_ml, step.description_en);
  const tips = ml ? (step.tips_ml || step.tips) : step.tips;
  return (
    <li className="relative pl-12 pb-6">
      {!last && <span className="absolute left-[18px] top-9 h-full w-0.5 bg-teal-100" aria-hidden="true" />}
      <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">{step.icon || step.step_number}</span>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-gray-900">{step.step_number}. {title}</h3>
        {step.duration && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">⏱ {step.duration}</span>}
      </div>
      {desc && <p className="mt-1 text-sm leading-relaxed text-gray-700">{desc}</p>}
      {tips && (
        <p className="mt-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs text-teal-900">
          💡 <span className="font-semibold">{ml ? 'നുറുങ്ങ്: ' : 'Tip: '}</span>{tips}
        </p>
      )}
    </li>
  );
}

export default async function JourneyDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const j = await getJourney(slug);
  if (!j) notFound();

  const steps = sortedSteps(j.journey_steps);
  const [doctors, hospitals] = await Promise.all([
    journeyDoctors(j.id, 3),
    searchHospitals({ page: 1, limit: 2 })
  ]);

  const title = pick(ml, j.title_ml, j.title_en);
  const excerpt = pick(ml, j.excerpt_ml, j.excerpt_en);
  const specialtyName = j.specialties && j.specialties[0]
    ? pick(ml, j.specialties[0].name_ml, j.specialties[0].name_en) : null;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage',
    name: j.title_en || title,
    description: j.excerpt_en || excerpt || title,
    url: `${SITE}/${locale}/journeys/${slug}`,
    inLanguage: ml ? 'ml-IN' : 'en-IN'
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/journeys`} className="hover:text-brand">{ml ? 'യാത്രാ ഗൈഡുകൾ' : 'Journey Guides'}</Link> › <span className="text-gray-700">{title}</span>
      </nav>

      <header className="space-y-1">
        {specialtyName && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{specialtyName}</span>}
        <h1 className="text-2xl font-extrabold text-gray-900">🗺️ {title}</h1>
        {excerpt && <p className="text-sm leading-relaxed text-gray-700">{excerpt}</p>}
        {j.body_en && <p className="text-sm leading-relaxed text-gray-600">{pick(ml, j.body_ml, j.body_en)}</p>}
      </header>

      {/* Step-by-step CSS timeline */}
      {steps.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഘട്ടം ഘട്ടമായി' : 'Step by step'}</h2>
          <ol className="list-none">
            {steps.map((s, i) => <Step key={s.step_number || i} step={s} locale={locale} last={i === steps.length - 1} />)}
          </ol>
        </section>
      )}

      {/* Related specialists */}
      {doctors.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{specialtyName ? (ml ? `${specialtyName} വിദഗ്ധർ` : `${specialtyName} specialists`) : (ml ? 'വിദഗ്ധർ' : 'Specialists')}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
        </section>
      )}

      {/* Related hospitals */}
      {hospitals.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ആശുപത്രികൾ' : 'Hospitals'}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {hospitals.map((h) => <HospitalCard key={h.id} hospital={h} locale={locale} />)}
          </div>
          <Link href={`/${locale}/hospitals`} className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">{ml ? 'എല്ലാ ആശുപത്രികളും →' : 'See all hospitals →'}</Link>
        </section>
      )}

      {/* Patient stories — future */}
      <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
        <p className="text-sm font-medium text-gray-600">💬 {ml ? 'രോഗികളുടെ അനുഭവങ്ങൾ — ഉടൻ വരുന്നു' : 'Patient stories — coming soon'}</p>
        <p className="mt-1 text-xs text-gray-500">{ml ? 'ഈ യാത്ര പൂർത്തിയാക്കിയവരുടെ അനുഭവങ്ങൾ ഇവിടെ പങ്കിടും.' : 'Real experiences from people who have completed this journey will appear here.'}</p>
      </section>

      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml
          ? 'ഈ ഗൈഡ് പൊതു വിവരങ്ങൾക്ക് മാത്രം — ചികിത്സാ ഉപദേശമല്ല. ഓരോ വ്യക്തിയുടെയും ചികിത്സ വ്യത്യാസപ്പെടും. നിങ്ങളുടെ ഡോക്ടറുമായി ചർച്ച ചെയ്യുക. അടിയന്തരം: 112 · ആംബുലൻസ്: 108.'
          : 'This guide is general information only — not medical advice. Every person’s care differs; discuss yours with your doctor. Emergency: 112 · Ambulance: 108.'}
      </div>
    </main>
  );
}
