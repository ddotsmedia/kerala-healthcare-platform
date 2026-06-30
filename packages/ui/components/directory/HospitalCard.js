// HospitalCard.js — directory list item: photo, name, type, district, badges.

import VerificationBadge from './VerificationBadge.js';

const TYPE_LABELS = {
  government: { ml: 'സർക്കാർ', en: 'Government' },
  private: { ml: 'സ്വകാര്യം', en: 'Private' },
  charitable: { ml: 'ചാരിറ്റബിൾ', en: 'Charitable' },
  ayurveda: { ml: 'ആയുർവേദം', en: 'Ayurveda' }
};
const EMERGENCY = { ml: '24x7 എമർജൻസി', en: '24x7 Emergency' };

export default function HospitalCard({ hospital, locale = 'ml' }) {
  const name = locale === 'ml' ? hospital.name_ml : hospital.name_en;
  const district = locale === 'ml' ? hospital.district_ml : hospital.district_en;
  const type = TYPE_LABELS[hospital.type];
  return (
    <a
      href={`/${locale}/hospitals/${hospital.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {hospital.logo_url && (
          <img src={hospital.logo_url} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
            <VerificationBadge status="verified" locale={locale} />
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
            {type && <span>{type[locale] || type.en}</span>}
            {district && <span>{district}</span>}
            {hospital.emergency_24x7 && <span className="font-medium text-red-600">{EMERGENCY[locale] || EMERGENCY.en}</span>}
          </div>
        </div>
      </div>
    </a>
  );
}
