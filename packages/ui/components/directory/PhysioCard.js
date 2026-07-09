// PhysioCard.js — physiotherapy centre directory item: name, specialisation
// badges, home-visit badge, rating, district, fee. Server component.

const SPEC_LABELS = {
  ortho: { ml: 'ഓർത്തോ', en: 'Ortho' }, neuro: { ml: 'ന്യൂറോ', en: 'Neuro' },
  cardio: { ml: 'കാർഡിയോ', en: 'Cardio' }, paediatric: { ml: 'ശിശു', en: 'Paediatric' },
  sports: { ml: 'സ്പോർട്സ്', en: 'Sports' }, geriatric: { ml: 'വയോജന', en: 'Geriatric' }
};

export default function PhysioCard({ centre: p, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? p.name_ml : p.name_en) || p.name_en;
  const district = ml ? p.district_ml : p.district_en;
  const specs = Array.isArray(p.specialisations) ? p.specialisations : [];
  const fee = p.session_fee_inr ?? p.consultation_fee_inr;
  return (
    <a href={`/${locale}/physiotherapy/${p.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {p.rating_count > 0 && <span className="shrink-0 text-xs font-medium text-amber-600">⭐ {Number(p.rating_avg).toFixed(1)} ({p.rating_count})</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        {fee != null && <span>₹{fee}{p.session_fee_inr != null ? (ml ? '/സെഷൻ' : '/session') : ''}</span>}
      </div>
      {specs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {specs.slice(0, 4).map((s) => {
            const l = SPEC_LABELS[s];
            return <span key={s} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{l ? (l[locale] || l.en) : s}</span>;
          })}
          {specs.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{specs.length - 4}</span>}
        </div>
      )}
      {p.has_home_visit && <p className="mt-1.5 text-xs font-medium text-brand">🏠 {ml ? 'ഹോം വിസിറ്റ് ലഭ്യം' : 'Home visit available'}</p>}
    </a>
  );
}
