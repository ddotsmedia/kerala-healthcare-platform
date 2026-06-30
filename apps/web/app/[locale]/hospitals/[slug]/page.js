// Hospital profile page. Verified + published only. Emits Hospital + MedicalWebPage JSON-LD.

import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getHospitalBySlug } from '@/lib/providers';
import { hospitalSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import VerifiedBadge from '@/components/VerifiedBadge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const h = await getHospitalBySlug(params.slug);
  if (!h) return { title: t(resolveLocale(params.locale), 'hospitals') };
  const name = h.name_en || h.name_ml;
  return {
    title: `${name}${h.district_en ? ' · ' + h.district_en : ''}`.slice(0, 60),
    description: `${name} — ${h.district_en || 'Kerala'}`.slice(0, 160)
  };
}

function nameOf(item, locale) {
  return locale === 'ml' ? (item.name_ml || item.name_en) : (item.name_en || item.name_ml);
}

export default async function HospitalProfile({ params }) {
  const locale = resolveLocale(params.locale);
  const hospital = await getHospitalBySlug(params.slug);
  if (!hospital) notFound();

  const name = nameOf(hospital, locale);
  const district = locale === 'ml' ? hospital.district_ml : hospital.district_en;
  const about = locale === 'ml' ? hospital.about_ml : hospital.about_en;
  const url = `${SITE}/${locale}/hospitals/${hospital.slug}`;
  const ld = [hospitalSchema(hospital, locale), medicalWebPageSchema(name, about || '', url)];

  return (
    <article className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{name}</h1>
          <VerifiedBadge locale={locale} />
        </div>
        <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
          {district && <span>{district}</span>}
          {hospital.emergency_24x7 && <span className="font-medium text-red-600">{t(locale, 'emergency_24x7')}</span>}
          {hospital.bed_count != null && <span>{hospital.bed_count} {t(locale, 'beds')}</span>}
        </div>
      </header>

      {about && <p className="text-sm leading-relaxed text-gray-800">{about}</p>}

      {hospital.departments && hospital.departments.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'departments')}</h2>
          <div className="flex flex-wrap gap-2">
            {hospital.departments.map((d, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{nameOf(d, locale)}</span>
            ))}
          </div>
        </section>
      )}

      {hospital.services && hospital.services.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'services')}</h2>
          <div className="flex flex-wrap gap-2">
            {hospital.services.map((s, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{nameOf(s, locale)}</span>
            ))}
          </div>
        </section>
      )}

      {hospital.accreditations && hospital.accreditations.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'accreditations')}</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            {hospital.accreditations.map((a, i) => (
              <li key={i}>{a.body}{a.accreditation_no ? ` — ${a.accreditation_no}` : ''}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
