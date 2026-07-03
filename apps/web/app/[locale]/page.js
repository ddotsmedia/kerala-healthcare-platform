// Homepage — world-class Kerala health portal landing. Malayalam-first.
// Chrome (emergency banner, navbar, footer) lives in the locale layout.
// Coloured sections break full-width via <FullBleed/>.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchDoctors, searchHospitals, listDistricts, listSpecialties } from '@/lib/providers';
import { listPublishedContent } from '@/lib/knowledge';
import { DoctorCard, HospitalCard } from '@khp/ui';
import {
  FullBleed, SectionHeading, Hero, StatsBar, HowItWorks, ToolsAndAI, specialtyIcon
} from '@/components/home/HomeSections';

// Live DB content at request time (providers are cached, so this stays fast).
export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'മലയാളി ഡോക്ടർ · കേരള ആരോഗ്യ പോർട്ടൽ' : 'MalayaliDoctor · Kerala Health Portal',
    description: ml
      ? 'കേരളത്തിലെ മികച്ച ഡോക്ടർമാരെയും ആശുപത്രികളെയും കണ്ടെത്തൂ. അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യൂ.'
      : 'Find the best doctors and hospitals in Kerala. Book appointments online.'
  };
}

export default async function HomePage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';

  const [specialties, districts, doctors, hospitals, articles] = await Promise.all([
    listSpecialties(),
    listDistricts(),
    searchDoctors({ page: 1, limit: 6 }),
    searchHospitals({ page: 1, limit: 4 }),
    listPublishedContent({ limit: 3 })
  ]);

  const nm = (r) => (ml ? r.name_ml : r.name_en) || r.name_en;

  return (
    <div className="-my-6">
      <Hero locale={locale} />
      <StatsBar locale={locale} />

      {/* Specialties */}
      <FullBleed className="bg-white py-14">
        <SectionHeading>{ml ? 'സ്പെഷ്യാലിറ്റി അനുസരിച്ച് തിരയുക' : 'Browse by specialty'}</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {specialties.slice(0, 12).map((s) => (
            <Link key={s.id} href={`/${locale}/doctors?specialty=${s.id}`}
              className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-3xl text-brand">{specialtyIcon(s.name_en)}</span>
              <span className="mt-2 text-sm font-semibold text-gray-900">{s.name_ml}</span>
              <span className="text-xs text-gray-500">{s.name_en}</span>
            </Link>
          ))}
        </div>
      </FullBleed>

      {/* Districts */}
      <FullBleed className="bg-gray-50 py-14">
        <SectionHeading>{ml ? 'ജില്ല തിരഞ്ഞെടുക്കൂ' : 'Choose a district'}</SectionHeading>
        <div className="flex flex-wrap justify-center gap-2.5">
          {districts.map((d) => (
            <Link key={d.id} href={`/${locale}/doctors?district=${d.id}`}
              className="rounded-full border border-brand px-4 py-1.5 text-sm font-medium text-brand transition hover:bg-brand hover:text-white">
              {nm(d)}
            </Link>
          ))}
        </div>
      </FullBleed>

      {/* Featured doctors */}
      {doctors.length > 0 && (
        <FullBleed className="bg-white py-14">
          <SectionHeading>{ml ? 'അനുശംസിക്കപ്പെട്ട ഡോക്ടർമാർ' : 'Recommended doctors'}</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${locale}/doctors`} className="text-sm font-semibold text-brand hover:underline">
              {ml ? 'എല്ലാ ഡോക്ടർമാരും കാണുക →' : 'View all doctors →'}
            </Link>
          </div>
        </FullBleed>
      )}

      {/* Featured hospitals */}
      {hospitals.length > 0 && (
        <FullBleed className="bg-gray-50 py-14">
          <SectionHeading>{ml ? 'പ്രമുഖ ആശുപത്രികൾ' : 'Leading hospitals'}</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hospitals.map((h) => <HospitalCard key={h.id} hospital={h} locale={locale} />)}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${locale}/hospitals`} className="text-sm font-semibold text-brand hover:underline">
              {ml ? 'എല്ലാ ആശുപത്രികളും കാണുക →' : 'View all hospitals →'}
            </Link>
          </div>
        </FullBleed>
      )}

      <HowItWorks locale={locale} />
      <ToolsAndAI locale={locale} />

      {/* Latest articles */}
      {articles.length > 0 && (
        <FullBleed className="bg-white py-14">
          <SectionHeading>{ml ? 'ആരോഗ്യ വാർത്തകൾ' : 'Health articles'}</SectionHeading>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.id} href={`/${locale}/health/${a.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="h-32 w-full bg-gradient-to-br from-teal-400 to-teal-600" />
                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{ml ? a.title_ml : a.title_en}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{ml ? a.excerpt_ml : a.excerpt_en}</p>
                  <span className="mt-2 inline-block text-sm font-medium text-brand group-hover:underline">
                    {ml ? 'കൂടുതൽ വായിക്കുക →' : 'Read more →'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${locale}/health`} className="text-sm font-semibold text-brand hover:underline">
              {ml ? 'എല്ലാ ലേഖനങ്ങളും →' : 'All articles →'}
            </Link>
          </div>
        </FullBleed>
      )}
    </div>
  );
}
