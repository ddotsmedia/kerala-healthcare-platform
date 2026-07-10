// HomeNursingCard.js — home nursing agency directory item: services, qualification,
// rates, rating, gender availability. Server component.

const SERVICE_LABELS = {
  general_nursing: { ml: 'ജനറൽ നഴ്സിംഗ്', en: 'General nursing' },
  icu_care: { ml: 'ICU കെയർ', en: 'ICU care' },
  post_surgical: { ml: 'ശസ്ത്രക്രിയാനന്തരം', en: 'Post-surgical' },
  elderly_care: { ml: 'വയോജന പരിചരണം', en: 'Elderly care' },
  baby_care: { ml: 'ശിശു പരിചരണം', en: 'Baby care' },
  physiotherapy: { ml: 'ഫിസിയോതെറാപ്പി', en: 'Physiotherapy' },
  wound_care: { ml: 'മുറിവ് പരിചരണം', en: 'Wound care' },
  palliative: { ml: 'പാലിയേറ്റീവ്', en: 'Palliative' }
};

function rate(a, ml) {
  if (a.monthly_rate_inr != null) return `₹${Number(a.monthly_rate_inr).toLocaleString('en-IN')}${ml ? '/മാസം' : '/mo'}`;
  if (a.daily_rate_inr != null) return `₹${Number(a.daily_rate_inr).toLocaleString('en-IN')}${ml ? '/ദിവസം' : '/day'}`;
  if (a.hourly_rate_inr != null) return `₹${a.hourly_rate_inr}${ml ? '/മണിക്കൂർ' : '/hr'}`;
  return null;
}

export default function HomeNursingCard({ agency: a, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? a.name_ml : a.name_en) || a.name_en;
  const district = ml ? a.district_ml : a.district_en;
  const services = Array.isArray(a.services) ? a.services : [];
  const r = rate(a, ml);
  return (
    <a href={`/${locale}/home-nursing/${a.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {a.is_registered && <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">{ml ? 'രജിസ്റ്റേഡ്' : 'Registered'}</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        {a.nurse_qualification && <span>🎓 {a.nurse_qualification}</span>}
        {a.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(a.rating_avg).toFixed(1)} ({a.rating_count})</span>}
      </div>
      {services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {services.slice(0, 4).map((s) => {
            const l = SERVICE_LABELS[s];
            return <span key={s} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{l ? (l[locale] || l.en) : s}</span>;
          })}
          {services.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{services.length - 4}</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs">
        {r && <span className="font-semibold text-gray-900">{r}</span>}
        <span className="text-gray-500">{[a.has_female_nurses && (ml ? 'വനിതാ' : 'Female'), a.has_male_nurses && (ml ? 'പുരുഷ' : 'Male')].filter(Boolean).join(' · ')}</span>
      </div>
    </a>
  );
}
