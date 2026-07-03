// Dynamic sitemap — specialties, districts, specialty+district combos,
// doctor + hospital profiles, across both locales.

import { LOCALES } from '@/lib/i18n';
import { listSpecialties, listDistricts } from '@/lib/providers';
import { combosWithDoctors, allDoctorSlugs, allHospitalSlugs, districtSlug } from '@/lib/landing';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const [specialties, districts, combos, doctors, hospitals] = await Promise.all([
    listSpecialties(), listDistricts(), combosWithDoctors(), allDoctorSlugs(), allHospitalSlugs()
  ]);

  const now = new Date();
  const out = [];
  const add = (path, priority, changeFrequency = 'weekly') =>
    out.push({ url: `${SITE}${path}`, lastModified: now, changeFrequency, priority });

  for (const locale of LOCALES) {
    add(`/${locale}`, 1.0, 'daily');
    add(`/${locale}/doctors`, 0.9, 'daily');
    add(`/${locale}/hospitals`, 0.8, 'daily');
    add(`/${locale}/specialties`, 0.8);
    add(`/${locale}/districts`, 0.8);
    for (const p of ['about', 'how-it-works', 'for-doctors', 'for-hospitals', 'contact', 'privacy', 'terms', 'disclaimer']) {
      add(`/${locale}/${p}`, 0.5, 'monthly');
    }

    for (const s of specialties) add(`/${locale}/specialties/${s.slug}`, 0.8);
    for (const d of districts) add(`/${locale}/districts/${districtSlug(d.name_en)}`, 0.8);
    for (const c of combos) add(`/${locale}/doctors/${districtSlug(c.district_name)}/${c.specialty_slug}`, 0.7);
    for (const d of doctors) if (d.slug) add(`/${locale}/doctors/${d.slug}`, 0.6);
    for (const h of hospitals) if (h.slug) add(`/${locale}/hospitals/${h.slug}`, 0.6);
  }

  return out;
}
