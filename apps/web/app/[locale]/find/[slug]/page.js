// Paid-search landing router. One dynamic segment carries a compound slug:
//   <specialty>-doctor-<district>   -> DoctorAdLanding
//   <role>-jobs-<district>          -> JobsAdLanding
// (Next.js allows only one param per segment, so the pattern is parsed here.)

import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getSpecialtyBySlug, getDistrictBySlug, countDoctors, countReviews } from '@/lib/landing';
import { searchDoctors } from '@/lib/providers';
import { searchJobs } from '@/lib/jobs';
import { pickUtm } from '@/lib/utm';
import { SITE } from '@/components/landing/LandingParts';
import UtmCapture from '@/components/landing/UtmCapture';
import DoctorAdLanding from '@/components/landing/DoctorAdLanding';
import JobsAdLanding from '@/components/landing/JobsAdLanding';

export const dynamic = 'force-dynamic';

const titleCase = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Parse the compound slug into a typed descriptor, or null. */
function parse(slug) {
  const s = String(slug || '').toLowerCase();
  let i = s.indexOf('-doctor-');
  if (i > 0 && i + 8 < s.length) return { kind: 'doctor', a: s.slice(0, i), district: s.slice(i + 8) };
  i = s.indexOf('-jobs-');
  if (i > 0 && i + 6 < s.length) return { kind: 'jobs', a: s.slice(0, i), district: s.slice(i + 6) };
  return null;
}

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const p = parse(slug);
  if (!p) return { title: 'MalayaliDoctor' };
  const district = await getDistrictBySlug(p.district);
  const diName = district ? (ml ? district.name_ml : district.name_en) || district.name_en : titleCase(p.district);
  if (p.kind === 'doctor') {
    const sp = await getSpecialtyBySlug(p.a);
    const spName = sp ? (ml ? sp.name_ml : sp.name_en) || sp.name_en : titleCase(p.a);
    const title = `Best ${spName} in ${diName}, Kerala | MalayaliDoctor`.slice(0, 65);
    return {
      title,
      description: `Find & book verified ${spName} doctors in ${diName}. Genuine reviews, free online booking on MalayaliDoctor.`.slice(0, 160),
      alternates: { canonical: `${SITE}/${locale}/find/${slug}` },
      robots: { index: false, follow: true } // paid-search landing — avoid duplicate-content with canonical directory pages
    };
  }
  const role = titleCase(p.a);
  const title = `${role} Jobs in ${diName}, Kerala | MalayaliDoctor`.slice(0, 65);
  return {
    title,
    description: `Latest ${role} jobs in ${diName}, Kerala. Apply directly and set free job alerts on MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/find/${slug}` },
    robots: { index: false, follow: true }
  };
}

export default async function FindLanding(props) {
  const { locale: raw, slug } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const p = parse(slug);
  if (!p) notFound();
  const utm = pickUtm(sp);

  const district = await getDistrictBySlug(p.district);
  if (!district) notFound();

  if (p.kind === 'doctor') {
    const specialty = await getSpecialtyBySlug(p.a);
    if (!specialty) notFound();
    const [doctors, verifiedCount, reviewCount] = await Promise.all([
      searchDoctors({ specialtyId: specialty.id, districtId: district.id, page: 1, limit: 3 }),
      countDoctors({ specialtyId: specialty.id, districtId: district.id }),
      countReviews({ specialtyId: specialty.id, districtId: district.id })
    ]);
    return (
      <>
        <UtmCapture />
        <DoctorAdLanding locale={locale} specialty={specialty} district={district}
          doctors={doctors} verifiedCount={verifiedCount} reviewCount={reviewCount} utm={utm} />
      </>
    );
  }

  const roleLabel = titleCase(p.a);
  const jobs = await searchJobs({ term: p.a.replace(/-/g, ' '), districtId: district.id, page: 1, limit: 5 });
  return (
    <>
      <UtmCapture />
      <JobsAdLanding locale={locale} roleLabel={roleLabel} district={district} jobs={jobs} utm={utm} />
    </>
  );
}
