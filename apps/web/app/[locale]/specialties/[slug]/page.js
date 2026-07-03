// Specialty landing page — SEO. "[Specialty] Doctors in Kerala".

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { searchDoctors, listDistricts, listSpecialties } from '@/lib/providers';
import { getSpecialtyBySlug, countDoctors, districtsCovered, feeRange } from '@/lib/landing';
import { specialtyDescription } from '@/components/landing/specialtyContent';
import { specialtyIcon } from '@/components/home/HomeSections';
import { LandingHero, StatsRow, Breadcrumb, SectionTitle, JsonLd, SITE } from '@/components/landing/LandingParts';
import { DoctorCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export const dynamic = 'force-dynamic';
const LIMIT = 12;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const sp = await getSpecialtyBySlug(params.slug);
  if (!sp) return { title: 'Not found' };
  return {
    title: `${sp.name_en} Doctors in Kerala | MalayaliDoctor`,
    description: `Find the best ${sp.name_en} doctors in Kerala. Book appointments online. Verified profiles.`,
    alternates: { canonical: `${SITE}/${locale}/specialties/${sp.slug}` }
  };
}

export default async function SpecialtyLanding(props) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const sp = await getSpecialtyBySlug(params.slug);
  if (!sp) notFound();

  const districtId = searchParams.district || '';
  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);

  const [doctors, districts, specialties, total, covered, fees] = await Promise.all([
    searchDoctors({ specialtyId: sp.id, districtId, page, limit: LIMIT }),
    listDistricts(),
    listSpecialties(),
    countDoctors({ specialtyId: sp.id }),
    districtsCovered(sp.id),
    feeRange(sp.id)
  ]);

  const name = ml ? sp.name_ml : sp.name_en;
  const basePath = `/${locale}/specialties/${sp.slug}`;
  const related = specialties.filter((s) => s.id !== sp.id).slice(0, 4);
  const feeText = fees.min != null ? `₹${fees.min}–₹${fees.max}` : '—';

  const ld = {
    '@context': 'https://schema.org', '@type': 'MedicalSpecialty',
    name: sp.name_en, url: `${SITE}${basePath}`,
    description: `${sp.name_en} doctors in Kerala on MalayaliDoctor.`
  };

  return (
    <div className="-my-6">
      <LandingHero
        icon={specialtyIcon(sp.name_en)}
        breadcrumb={<Breadcrumb items={[
          { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
          { name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', href: `/${locale}/doctors` },
          { name }
        ]} />}
        title={ml ? `കേരളത്തിലെ ${name} ഡോക്ടർമാർ` : `Find ${sp.name_en} Doctors in Kerala`}
        subtitle={ml ? sp.name_en : sp.name_ml}
      />
      <StatsRow stats={[
        { value: total, label: ml ? 'ഡോക്ടർമാർ' : 'Doctors' },
        { value: covered, label: ml ? 'ജില്ലകൾ' : 'Districts covered' },
        { value: feeText, label: ml ? 'ഫീസ് പരിധി' : 'Fee range' }
      ]} />

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
          <JsonLd data={ld} />

          <section>
            <SectionTitle>{ml ? `${name} എന്നാൽ` : `About ${sp.name_en}`}</SectionTitle>
            <p className="text-sm leading-relaxed text-gray-600">{specialtyDescription(sp.slug, locale)}</p>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle>{ml ? `${name} ഡോക്ടർമാർ` : `${sp.name_en} Doctors`}</SectionTitle>
              <form method="get" action={basePath} className="flex items-end gap-2">
                <DistrictFilter districts={districts} selected={districtId} locale={locale} />
                <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
                  {ml ? 'ഫിൽട്ടർ' : 'Filter'}
                </button>
              </form>
            </div>
            {doctors.length === 0 ? (
              <EmptyState message={ml ? 'ഡോക്ടർമാരെ കണ്ടെത്തിയില്ല' : 'No doctors found'} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
                </div>
                <div className="mt-6">
                  <Pagination basePath={basePath} query={{ district: districtId }} page={page} hasNext={doctors.length === LIMIT} locale={locale} />
                </div>
              </>
            )}
          </section>

          {related.length > 0 && (
            <section>
              <SectionTitle>{ml ? 'മറ്റ് സ്പെഷ്യാലിറ്റികൾ' : 'Related specialties'}</SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {related.map((s) => (
                  <Link key={s.id} href={`/${locale}/specialties/${s.slug}`}
                    className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md">
                    <span className="text-2xl text-brand">{specialtyIcon(s.name_en)}</span>
                    <span className="mt-1 text-sm font-semibold text-gray-900">{ml ? s.name_ml : s.name_en}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <MedicalDisclaimer locale={locale} />
    </div>
  );
}
