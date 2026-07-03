// DoctorCard.js — directory list item: photo, name, specialty, district,
// verification badge, fee, consultation modes, book CTA. Framework-neutral (<a>).

import VerificationBadge from './VerificationBadge.js';
import ConsultationModeChip from './ConsultationModeChip.js';

const T = {
  experience: { ml: 'വർഷം', en: 'yrs' },
  fee: { ml: 'ഫീസ്', en: 'Fee' },
  view: { ml: 'പ്രൊഫൈൽ കാണുക', en: 'View profile' }
};
const tr = (k, l) => (T[k][l] || T[k].en);

export default function DoctorCard({ doctor, locale = 'ml' }) {
  const specialty = locale === 'ml' ? doctor.specialty_ml : doctor.specialty_en;
  const district = locale === 'ml' ? doctor.district_ml : doctor.district_en;
  const modes = doctor.consultation_modes || [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {doctor.photo_url && (
          <img src={doctor.photo_url} alt={doctor.display_name ? `Dr ${doctor.display_name}` : ''} loading="lazy" decoding="async" width="56" height="56" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">{doctor.display_name}</h3>
            <VerificationBadge status="verified" locale={locale} />
          </div>
          {specialty && <p className="mt-0.5 text-sm text-brand">{specialty}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
            {district && <span>{district}</span>}
            {doctor.years_experience != null && <span>{doctor.years_experience} {tr('experience', locale)}</span>}
            {doctor.consultation_fee != null && <span>{tr('fee', locale)}: ₹{doctor.consultation_fee}</span>}
            {doctor.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(doctor.rating_avg).toFixed(1)} ({doctor.rating_count})</span>}
          </div>
          {modes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {modes.map((m) => <ConsultationModeChip key={m} mode={m} locale={locale} />)}
            </div>
          )}
        </div>
      </div>
      <a
        href={`/${locale}/doctors/${doctor.slug}`}
        className="mt-3 block rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
      >
        {tr('view', locale)}
      </a>
    </div>
  );
}
