// AmbulanceCard.js — emergency-oriented: name, LARGE tap-to-call phone, type badges,
// coverage area, 24hr badge. Server component.

const TYPE_LABELS = {
  government: { ml: 'സർക്കാർ', en: 'Government' },
  private: { ml: 'സ്വകാര്യം', en: 'Private' },
  ngo: { ml: 'എൻ‌ജി‌ഒ', en: 'NGO' },
  'hospital-based': { ml: 'ആശുപത്രി', en: 'Hospital-based' }
};
const AMB_TONE = {
  icu: 'bg-red-100 text-red-700', nicu: 'bg-purple-100 text-purple-700',
  advanced: 'bg-orange-100 text-orange-700', basic: 'bg-gray-100 text-gray-700',
  air: 'bg-sky-100 text-sky-700', mortuary: 'bg-slate-200 text-slate-700'
};

export function AmbulanceTypeBadges({ types = [] }) {
  if (!Array.isArray(types) || !types.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {types.map((t) => <span key={t} className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${AMB_TONE[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>)}
    </div>
  );
}

export default function AmbulanceCard({ provider: a, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? a.name_ml : a.name_en) || a.name_en;
  const district = ml ? a.district_ml : a.district_en;
  const type = TYPE_LABELS[a.type];
  const phones = Array.isArray(a.phone) ? a.phone : (a.phone ? [a.phone] : []);
  const callNum = phones[0];
  const coverage = Array.isArray(a.coverage_districts) ? a.coverage_districts : [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <a href={`/${locale}/ambulance/${a.slug}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
          {a.is_24hr && <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">24h</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
          {type && <span>{type[locale] || type.en}</span>}
          {district && <span>📍 {district}</span>}
        </div>
      </a>
      <div className="mt-2"><AmbulanceTypeBadges types={a.ambulance_types} /></div>
      {coverage.length > 0 && <p className="mt-1.5 text-xs text-gray-500">{ml ? 'കവറേജ്' : 'Covers'}: {coverage.slice(0, 4).join(', ')}{coverage.length > 4 ? '…' : ''}</p>}
      {callNum && (
        <a href={`tel:${callNum}`} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-base font-bold text-white hover:bg-red-700">
          📞 {ml ? 'വിളിക്കുക' : 'Call'} {callNum}
        </a>
      )}
    </div>
  );
}
