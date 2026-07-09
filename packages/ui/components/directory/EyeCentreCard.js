// EyeCentreCard.js — ophthalmology centre directory item: name, type, surgery
// badges, rating, district, fee. Server component.

const TYPE_LABELS = {
  hospital: { ml: 'ആശുപത്രി', en: 'Hospital' },
  clinic: { ml: 'ക്ലിനിക്ക്', en: 'Clinic' },
  optical_shop: { ml: 'ഒപ്റ്റിക്കൽ ഷോപ്പ്', en: 'Optical shop' }
};
const SURG_LABELS = {
  cataract: { ml: 'തിമിരം', en: 'Cataract' }, lasik: { ml: 'ലാസിക്', en: 'LASIK' },
  glaucoma: { ml: 'ഗ്ലോക്കോമ', en: 'Glaucoma' }, retina: { ml: 'റെറ്റിന', en: 'Retina' },
  cornea: { ml: 'കോർണിയ', en: 'Cornea' }, squint: { ml: 'കോങ്കണ്ണ്', en: 'Squint' }
};

export default function EyeCentreCard({ centre: e, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? e.name_ml : e.name_en) || e.name_en;
  const district = ml ? e.district_ml : e.district_en;
  const type = TYPE_LABELS[e.type];
  const surgeries = Array.isArray(e.surgeries_offered) ? e.surgeries_offered : [];
  return (
    <a href={`/${locale}/eye-hospitals/${e.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {e.rating_count > 0 && <span className="shrink-0 text-xs font-medium text-amber-600">⭐ {Number(e.rating_avg).toFixed(1)} ({e.rating_count})</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {type && <span>{type[locale] || type.en}</span>}
        {district && <span>📍 {district}</span>}
        {e.consultation_fee_inr != null && <span>₹{e.consultation_fee_inr}</span>}
      </div>
      {surgeries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {surgeries.slice(0, 4).map((s) => {
            const l = SURG_LABELS[s];
            return <span key={s} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{l ? (l[locale] || l.en) : s}</span>;
          })}
          {surgeries.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{surgeries.length - 4}</span>}
        </div>
      )}
      {e.has_optical_shop && <p className="mt-1.5 text-xs text-gray-500">👓 {ml ? 'ഒപ്റ്റിക്കൽ ഷോപ്പ് ലഭ്യം' : 'Optical shop available'}</p>}
    </a>
  );
}
