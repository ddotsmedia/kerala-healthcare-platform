// DoctorCard.js — directory list item for a doctor. Server component.

import Link from 'next/link';
import { t } from '@/lib/i18n';
import VerifiedBadge from './VerifiedBadge';

export default function DoctorCard({ locale, doctor }) {
  const specialty = locale === 'ml' ? doctor.specialty_ml : doctor.specialty_en;
  const district = locale === 'ml' ? doctor.district_ml : doctor.district_en;
  return (
    <Link
      href={`/${locale}/doctors/${doctor.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{doctor.display_name}</h3>
        <VerifiedBadge locale={locale} />
      </div>
      {specialty && <p className="mt-1 text-sm text-brand">{specialty}</p>}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {district && <span>{district}</span>}
        {doctor.years_experience != null && (
          <span>{doctor.years_experience} {t(locale, 'experience')}</span>
        )}
      </div>
    </Link>
  );
}
