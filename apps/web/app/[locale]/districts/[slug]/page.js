// District landing page — SEO. "Doctors in [District]".

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { searchDoctors, searchHospitals, listSpecialties } from '@/lib/providers';
import {
  getDistrictBySlug, countDoctors, countHospitals, specialtiesInDistrict,
  specialtyCountsInDistrict, districtSlug
} from '@/lib/landing';
import { LandingHero, StatsRow, Breadcrumb, SectionTitle, JsonLd, SITE } from '@/components/landing/LandingParts';
import { DoctorCard, HospitalCard, EmptyState, SpecialtyFilter, Pagination } from '@khp/ui';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export const dynamic = 'force-dynamic';
const LIMIT = 12;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const di = await getDistrictBySlug(params.slug);
  if (!di) return { title: 'Not found' };
  return {
    title: `Doctors in ${di.name_en} | MalayaliDoctor`,
    description: `Find verified doctors and hospitals in ${di.name_en}, Kerala. Book appointments online.`,
    alternates: { canonical: `${SITE}/${locale}/districts/${districtSlug(di.name_en)}` }
  };
}

export default async function DistrictLanding(props) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const di = await getDistrictBySlug(params.slug);
  if (!di) notFound();

  const specialtyId = searchParams.specialty || '';
  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);
  const dslug = districtSlug(di.name_en);

  const [doctors, hospitals, specialties, totalDoc, totalHosp, spCount, popular] = await Promise.all([
    searchDoctors({ districtId: di.id, specialtyId, page, limit: LIMIT }),
    searchHospitals({ districtId: di.id, page: 1, limit: 8 }),
    listSpecialties(),
    countDoctors({ districtId: di.id }),
    countHospitals({ districtId: di.id }),
    specialtiesInDistrict(di.id),
    specialtyCountsInDistrict(di.id)
  ]);

  const name = ml ? di.name_ml : di.name_en;
  const basePath = `/${locale}/districts/${dslug}`;

  const ld = {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage',
    name: `Doctors in ${di.name_en}`, url: `${SITE}${basePath}`,
    about: { '@type': 'City', name: di.name_en }
  };

  return (
    <div className="-my-6">
      <LandingHero
        icon="📍"
        breadcrumb={<Breadcrumb items={[
          { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
          { name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', href: `/${locale}/doctors` },
          { name }
        ]} />}
        title={ml ? `${name} ജില്ലയിലെ ഡോക്ടർമാർ` : `Doctors in ${di.name_en}`}
        subtitle={ml ? di.name_en : di.name_ml}
      />
      <StatsRow stats={[
        { value: totalDoc, label: ml ? 'ഡോക്ടർമാർ' : 'Doctors' },
        { value: totalHosp, label: ml ? 'ആശുപത്രികൾ' : 'Hospitals' },
        { value: spCount, label: ml ? 'സ്പെഷ്യാലിറ്റികൾ' : 'Specialties' }
      ]} />

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
          <JsonLd data={ld} />

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle>{ml ? `${name} ജില്ലയിലെ ഡോക്ടർമാർ` : `Doctors in ${di.name_en}`}</SectionTitle>
              <form method="get" action={basePath} className="flex items-end gap-2">
                <SpecialtyFilter specialties={specialties} selected={specialtyId} locale={locale} />
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
                  <Pagination basePath={basePath} query={{ specialty: specialtyId }} page={page} hasNext={doctors.length === LIMIT} locale={locale} />
                </div>
              </>
            )}
          </section>

          {popular.length > 0 && (
            <section>
              <SectionTitle>{ml ? `${name}-ലെ ജനപ്രിയ സ്പെഷ്യാലിറ്റികൾ` : `Popular specialties in ${di.name_en}`}</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {popular.map((s) => (
                  <Link key={s.id} href={`/${locale}/doctors/${dslug}/${s.slug}`}
                    className="rounded-full border border-brand px-4 py-1.5 text-sm font-medium text-brand transition hover:bg-brand hover:text-white">
                    {ml ? s.name_ml : s.name_en} <span className="opacity-70">({s.count})</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {hospitals.length > 0 && (
            <section>
              <SectionTitle>{ml ? `${name} ജില്ലയിലെ ആശുപത്രികൾ` : `Hospitals in ${di.name_en}`}</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {hospitals.map((h) => <HospitalCard key={h.id} hospital={h} locale={locale} />)}
              </div>
            </section>
          )}
        </div>
      </div>

      <MedicalDisclaimer locale={locale} />
    </div>
  );
}
