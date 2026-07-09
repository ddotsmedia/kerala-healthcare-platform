// DentalCard.js — dental-clinic directory item: name, treatment badges, rating,
// district, fee. Server component.

const TREAT_LABELS = {
  cleaning: { ml: 'ക്ലീനിംഗ്', en: 'Cleaning' }, filling: { ml: 'ഫില്ലിംഗ്', en: 'Filling' },
  root_canal: { ml: 'റൂട്ട് കനാൽ', en: 'Root canal' }, implant: { ml: 'ഇംപ്ലാന്റ്', en: 'Implant' },
  braces: { ml: 'ബ്രേസസ്', en: 'Braces' }, whitening: { ml: 'വൈറ്റനിംഗ്', en: 'Whitening' },
  extraction: { ml: 'എക്സ്ട്രാക്ഷൻ', en: 'Extraction' }, pediatric: { ml: 'ശിശു ദന്ത', en: 'Pediatric' },
  orthodontics: { ml: 'ഓർത്തോ', en: 'Orthodontics' }
};

export default function DentalCard({ clinic: c, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? c.name_ml : c.name_en) || c.name_en;
  const district = ml ? c.district_ml : c.district_en;
  const treatments = Array.isArray(c.treatments_offered) ? c.treatments_offered : [];
  return (
    <a href={`/${locale}/dental/${c.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {c.rating_count > 0 && <span className="shrink-0 text-xs font-medium text-amber-600">⭐ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        {c.consultation_fee_inr != null && <span>₹{c.consultation_fee_inr} {ml ? 'കൺസൾട്ടേഷൻ' : 'consult'}</span>}
      </div>
      {treatments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {treatments.slice(0, 4).map((t) => {
            const l = TREAT_LABELS[t];
            return <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{l ? (l[locale] || l.en) : t}</span>;
          })}
          {treatments.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{treatments.length - 4}</span>}
        </div>
      )}
    </a>
  );
}
