// HospitalCard.js — directory list item for a hospital. Server component.

import Link from 'next/link';
import { t } from '@/lib/i18n';
import VerifiedBadge from './VerifiedBadge';

export default function HospitalCard({ locale, hospital }) {
  const name = locale === 'ml' ? hospital.name_ml : hospital.name_en;
  const district = locale === 'ml' ? hospital.district_ml : hospital.district_en;
  return (
    <Link
      href={`/${locale}/hospitals/${hospital.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <VerifiedBadge locale={locale} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {district && <span>{district}</span>}
        {hospital.emergency_24x7 && (
          <span className="font-medium text-red-600">{t(locale, 'emergency_24x7')}</span>
        )}
        {hospital.bed_count != null && <span>{hospital.bed_count} {t(locale, 'beds')}</span>}
      </div>
    </Link>
  );
}
