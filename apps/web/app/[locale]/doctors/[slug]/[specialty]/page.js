// Specialty + district combination page — highest-value SEO.
// "[Specialty] in [District]" e.g. Cardiologist in Thrissur.
// First segment is [slug] to match the sibling /doctors/[slug] profile route
// (Next requires one dynamic-param name per path position); here it is the district.

import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { searchDoctors } from '@/lib/providers';
import { getDistrictBySlug, getSpecialtyBySlug, countDoctors, districtSlug } from '@/lib/landing';
import { specialtyIcon } from '@/components/home/HomeSections';
import { LandingHero, StatsRow, Breadcrumb, JsonLd, SITE } from '@/components/landing/LandingParts';
import { DoctorCard, EmptyState, Pagination } from '@khp/ui';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export const dynamic = 'force-dynamic';
const LIMIT = 12;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const [di, sp] = await Promise.all([getDistrictBySlug(params.slug), getSpecialtyBySlug(params.specialty)]);
  if (!di || !sp) return { title: 'Not found' };
  return {
    title: `${sp.name_en} in ${di.name_en} | MalayaliDoctor`,
    description: `Find the best ${sp.name_en} doctors in ${di.name_en}, Kerala. Verified. Book online.`,
    alternates: { canonical: `${SITE}/${locale}/doctors/${districtSlug(di.name_en)}/${sp.slug}` }
  };
}

export default async function ComboLanding(props) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const [di, sp] = await Promise.all([getDistrictBySlug(params.slug), getSpecialtyBySlug(params.specialty)]);
  if (!di || !sp) notFound();

  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);
  const [doctors, total] = await Promise.all([
    searchDoctors({ districtId: di.id, specialtyId: sp.id, page, limit: LIMIT }),
    countDoctors({ districtId: di.id, specialtyId: sp.id })
  ]);

  const dName = ml ? di.name_ml : di.name_en;
  const spName = ml ? sp.name_ml : sp.name_en;
  const dslug = districtSlug(di.name_en);
  const basePath = `/${locale}/doctors/${dslug}/${sp.slug}`;

  const ld = {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage',
    name: `${sp.name_en} in ${di.name_en}`, url: `${SITE}${basePath}`,
    about: [{ '@type': 'MedicalSpecialty', name: sp.name_en }, { '@type': 'City', name: di.name_en }]
  };

  return (
    <div className="-my-6">
      <LandingHero
        icon={specialtyIcon(sp.name_en)}
        breadcrumb={<Breadcrumb items={[
          { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
          { name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', href: `/${locale}/doctors` },
          { name: dName, href: `/${locale}/districts/${dslug}` },
          { name: spName }
        ]} />}
        title={ml ? `${dName}-ലെ ${spName} ഡോക്ടർമാർ` : `${sp.name_en} in ${di.name_en}`}
        subtitle={ml ? `${sp.name_en} · ${di.name_en}` : `${sp.name_ml} · ${di.name_ml}`}
      />
      <StatsRow stats={[
        { value: total, label: ml ? 'ഡോക്ടർമാർ' : 'Doctors' },
        { value: dName, label: ml ? 'ജില്ല' : 'District' },
        { value: spName, label: ml ? 'സ്പെഷ്യാലിറ്റി' : 'Specialty' }
      ]} />

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <JsonLd data={ld} />
          {doctors.length === 0 ? (
            <EmptyState message={ml ? 'ഡോക്ടർമാരെ കണ്ടെത്തിയില്ല' : 'No doctors found'} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
              </div>
              <div className="mt-6">
                <Pagination basePath={basePath} query={{}} page={page} hasNext={doctors.length === LIMIT} locale={locale} />
              </div>
            </>
          )}
        </div>
      </div>

      <MedicalDisclaimer locale={locale} />
    </div>
  );
}
