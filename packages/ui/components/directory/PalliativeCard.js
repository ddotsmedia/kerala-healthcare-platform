// PalliativeCard.js — palliative-care directory item. Warm, dignity-focused
// design (rose/amber, not clinical teal). Server component.

const TYPE_LABELS = {
  hospital_unit: { ml: 'ആശുപത്രി യൂണിറ്റ്', en: 'Hospital unit' },
  standalone: { ml: 'സ്വതന്ത്ര കേന്ദ്രം', en: 'Standalone centre' },
  home_care: { ml: 'ഹോം കെയർ', en: 'Home care' },
  ngo: { ml: 'എൻ‌ജി‌ഒ', en: 'NGO' },
  hospice: { ml: 'ഹോസ്‌പിസ്', en: 'Hospice' }
};
const SERVICE_LABELS = {
  pain_management: { ml: 'വേദന നിയന്ത്രണം', en: 'Pain management' },
  counselling: { ml: 'കൗൺസലിംഗ്', en: 'Counselling' },
  nursing: { ml: 'നഴ്സിംഗ്', en: 'Nursing' },
  physiotherapy: { ml: 'ഫിസിയോതെറാപ്പി', en: 'Physiotherapy' },
  spiritual_care: { ml: 'ആത്മീയ പിന്തുണ', en: 'Spiritual care' },
  bereavement: { ml: 'ദുഃഖ പിന്തുണ', en: 'Bereavement support' }
};

export default function PalliativeCard({ centre: p, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? p.name_ml : p.name_en) || p.name_en;
  const district = ml ? p.district_ml : p.district_en;
  const type = TYPE_LABELS[p.type];
  const services = Array.isArray(p.services) ? p.services : [];
  return (
    <a href={`/${locale}/palliative-care/${p.slug}`} className="block rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {p.is_free_of_cost && <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">{ml ? 'സൗജന്യം' : 'Free of cost'}</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {type && <span>{type[locale] || type.en}</span>}
        {district && <span>📍 {district}</span>}
      </div>
      {services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {services.slice(0, 4).map((s) => {
            const l = SERVICE_LABELS[s];
            return <span key={s} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-rose-700">{l ? (l[locale] || l.en) : s}</span>;
          })}
          {services.length > 4 && <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">+{services.length - 4}</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs">
        {p.has_home_visits && <span className="font-medium text-amber-700">🏠 {ml ? 'ഹോം വിസിറ്റ്' : 'Home visits'}</span>}
        {p.has_inpatient && <span className="text-gray-500">{ml ? 'ഇൻപേഷ്യന്റ്' : 'Inpatient'}{p.inpatient_beds ? ` · ${p.inpatient_beds} ${ml ? 'ബെഡ്' : 'beds'}` : ''}</span>}
      </div>
    </a>
  );
}
