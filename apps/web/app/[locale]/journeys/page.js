// Treatment Journey Guides — long-form step-by-step guides. Browse by specialty.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listJourneys, journeySpecialties } from '@/lib/journeys';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ചികിത്സാ യാത്രാ ഗൈഡുകൾ | MalayaliDoctor' : 'Treatment Journey Guides | MalayaliDoctor',
    description: ml
      ? 'കാൽമുട്ട് മാറ്റിവയ്ക്കൽ, ഐവിഎഫ്, കീമോ, ഡയാലിസിസ്, ബൈപാസ് — ഘട്ടം ഘട്ടമായുള്ള ചികിത്സാ യാത്രാ ഗൈഡുകൾ.'
      : 'Step-by-step guides to major treatment journeys — knee replacement, IVF, chemotherapy, dialysis and cardiac bypass.'
  };
}

function JourneyCard({ journey, locale }) {
  const ml = locale === 'ml';
  const title = (ml ? journey.title_ml : journey.title_en) || journey.title_en;
  const excerpt = (ml ? journey.excerpt_ml : journey.excerpt_en) || journey.excerpt_en;
  return (
    <Link href={`/${locale}/journeys/${journey.slug}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand">
      <div className="text-2xl">🗺️</div>
      <h2 className="mt-1 text-lg font-bold text-gray-900">{title}</h2>
      {excerpt && <p className="mt-1 text-sm text-gray-600">{excerpt}</p>}
      <p className="mt-2 text-xs font-semibold text-brand">
        {journey.step_count} {ml ? 'ഘട്ടങ്ങൾ' : 'steps'} · {ml ? 'വായിക്കൂ →' : 'Read guide →'}
      </p>
    </Link>
  );
}

export default async function JourneysIndex(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const specialty = sp.specialty || '';

  const [journeys, specialties] = await Promise.all([
    listJourneys({ specialtyId: specialty || undefined }),
    journeySpecialties()
  ]);
  const base = `/${locale}/journeys`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🗺️ {ml ? 'ചികിത്സാ യാത്രാ ഗൈഡുകൾ' : 'Treatment Journey Guides'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'ഓരോ ഘട്ടത്തിലും എന്ത് പ്രതീക്ഷിക്കാം എന്ന് അറിയൂ' : 'Know what to expect at every stage'}</p>
        </div>
      </FullBleed>

      {specialties.length > 0 && (
        <FullBleed className="bg-white py-6">
          <div className="mx-auto max-w-4xl px-4">
            <nav className="flex flex-wrap gap-2" aria-label={ml ? 'സ്പെഷ്യാലിറ്റി' : 'Specialty'}>
              <Link href={base} className={chip(!specialty)}>{ml ? 'എല്ലാം' : 'All'}</Link>
              {specialties.map((s) => (
                <Link key={s.id} href={`${base}?specialty=${s.id}`} className={chip(specialty === s.id)}>
                  {(ml ? s.name_ml : s.name_en) || s.name_en}
                </Link>
              ))}
            </nav>
          </div>
        </FullBleed>
      )}

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          {journeys.length === 0 ? (
            <EmptyState title={ml ? 'ഗൈഡുകളൊന്നും കണ്ടെത്തിയില്ല' : 'No guides found'} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {journeys.map((j) => <JourneyCard key={j.id} journey={j} locale={locale} />)}
            </div>
          )}
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഈ ഗൈഡുകൾ പൊതു വിവരങ്ങൾക്ക് മാത്രം — ഓരോ രോഗിയുടെയും ചികിത്സ വ്യത്യാസപ്പെടും. നിങ്ങളുടെ ഡോക്ടറുടെ നിർദ്ദേശം പിന്തുടരുക.'
              : 'These guides are general information only — every patient’s care differs. Follow your own doctor’s advice.'}
          </p>
        </div>
      </FullBleed>
    </div>
  );
}
