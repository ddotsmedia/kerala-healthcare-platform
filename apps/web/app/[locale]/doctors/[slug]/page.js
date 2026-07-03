// Doctor profile page. Verified + published only. Emits Physician + MedicalWebPage JSON-LD.

import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getDoctorBySlug } from '@/lib/providers';
import { physicianSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import VerifiedBadge from '@/components/VerifiedBadge';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const doctor = await getDoctorBySlug(params.slug);
  if (!doctor) return { title: t(resolveLocale(params.locale), 'doctors') };
  const sp = doctor.specialty_en || doctor.specialty_ml || '';
  return {
    title: `${doctor.display_name}${sp ? ' · ' + sp : ''}`.slice(0, 60),
    description: `${doctor.display_name} — ${sp}, ${doctor.district_en || 'Kerala'}`.slice(0, 160)
  };
}

export default async function DoctorProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const doctor = await getDoctorBySlug(params.slug);
  if (!doctor) notFound();

  const specialty = locale === 'ml' ? doctor.specialty_ml : doctor.specialty_en;
  const district = locale === 'ml' ? doctor.district_ml : doctor.district_en;
  const about = locale === 'ml' ? doctor.about_ml : doctor.about_en;
  const url = `${SITE}/${locale}/doctors/${doctor.slug}`;
  const ld = [physicianSchema(doctor, locale), medicalWebPageSchema(doctor.display_name, about || '', url)];

  return (
    <article className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{doctor.display_name}</h1>
          <VerifiedBadge locale={locale} />
        </div>
        {specialty && <p className="text-brand">{specialty}</p>}
        <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
          {district && <span>{district}</span>}
          {doctor.years_experience != null && (
            <span>{doctor.years_experience} {t(locale, 'experience')}</span>
          )}
          {doctor.consultation_fee != null && (
            <span>{t(locale, 'consultation_fee')}: ₹{doctor.consultation_fee}</span>
          )}
        </div>
      </header>

      <a href={`/${locale}/book/${doctor.slug}`}
         className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {t(locale, 'book_now')}
      </a>

      {about && <p className="text-sm leading-relaxed text-gray-800">{about}</p>}

      {doctor.education && doctor.education.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{locale === 'ml' ? 'വിദ്യാഭ്യാസം' : 'Education'}</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            {doctor.education.map((e, i) => (
              <li key={i}>
                {e.degree}
                {(e.institution_en || e.institution_ml) && ` — ${locale === 'ml' ? (e.institution_ml || e.institution_en) : (e.institution_en || e.institution_ml)}`}
                {e.year_completed ? ` (${e.year_completed})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
