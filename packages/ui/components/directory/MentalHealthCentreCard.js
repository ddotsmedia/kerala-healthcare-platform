// MentalHealthCentreCard.js — compassionate, non-stigmatising directory item.
// Service badges, emergency/inpatient availability. Server component.

const TYPE_LABELS = {
  hospital: { ml: 'ആശുപത്രി', en: 'Hospital' }, clinic: { ml: 'ക്ലിനിക്ക്', en: 'Clinic' },
  rehab: { ml: 'റീഹാബ്', en: 'Rehabilitation' }, deaddiction: { ml: 'ഡീ-അഡിക്ഷൻ', en: 'De-addiction' },
  ngo: { ml: 'എൻ‌ജി‌ഒ', en: 'NGO' }, counselling: { ml: 'കൗൺസലിംഗ്', en: 'Counselling' }
};
const SERVICE_LABELS = {
  psychiatry: { ml: 'സൈക്യാട്രി', en: 'Psychiatry' }, psychology: { ml: 'സൈക്കോളജി', en: 'Psychology' },
  counselling: { ml: 'കൗൺസലിംഗ്', en: 'Counselling' }, deaddiction: { ml: 'ഡീ-അഡിക്ഷൻ', en: 'De-addiction' },
  rehabilitation: { ml: 'പുനരധിവാസം', en: 'Rehabilitation' }, group_therapy: { ml: 'ഗ്രൂപ്പ് തെറാപ്പി', en: 'Group therapy' }
};

export default function MentalHealthCentreCard({ centre: m, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? m.name_ml : m.name_en) || m.name_en;
  const district = ml ? m.district_ml : m.district_en;
  const type = TYPE_LABELS[m.type];
  const services = Array.isArray(m.services) ? m.services : [];
  return (
    <a href={`/${locale}/mental-health-centres/${m.slug}`} className="block rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {m.is_govt_approved && <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">{ml ? 'സർക്കാർ അംഗീകൃതം' : 'Govt approved'}</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {type && <span>{type[locale] || type.en}</span>}
        {district && <span>📍 {district}</span>}
        {m.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(m.rating_avg).toFixed(1)} ({m.rating_count})</span>}
      </div>
      {services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {services.slice(0, 4).map((s) => {
            const l = SERVICE_LABELS[s];
            return <span key={s} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{l ? (l[locale] || l.en) : s}</span>;
          })}
          {services.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{services.length - 4}</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs">
        {m.has_emergency && <span className="font-medium text-rose-600">{ml ? '24x7 അടിയന്തര പിന്തുണ' : '24x7 emergency support'}</span>}
        {m.has_inpatient && <span className="text-gray-500">{ml ? 'ഇൻപേഷ്യന്റ്' : 'Inpatient'}{m.inpatient_beds ? ` · ${m.inpatient_beds} ${ml ? 'ബെഡ്' : 'beds'}` : ''}</span>}
      </div>
    </a>
  );
}
