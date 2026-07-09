// BloodBankCard.js — emergency-oriented: name, LARGE tap-to-call phone, district,
// available blood-type badges, 24hr badge. Server component.

const TYPE_TONE = {
  'O-': 'bg-red-600 text-white', 'O+': 'bg-red-500 text-white',
  'A-': 'bg-rose-100 text-rose-700', 'A+': 'bg-rose-100 text-rose-700',
  'B-': 'bg-orange-100 text-orange-700', 'B+': 'bg-orange-100 text-orange-700',
  'AB-': 'bg-purple-100 text-purple-700', 'AB+': 'bg-purple-100 text-purple-700'
};

export function BloodTypeBadges({ types = [] }) {
  if (!Array.isArray(types) || !types.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {types.map((t) => (
        <span key={t} className={`rounded px-1.5 py-0.5 text-xs font-bold ${TYPE_TONE[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
      ))}
    </div>
  );
}

export default function BloodBankCard({ bank: b, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? b.name_ml : b.name_en) || b.name_en;
  const district = ml ? b.district_ml : b.district_en;
  const phones = Array.isArray(b.phone) ? b.phone : (b.phone ? [b.phone] : []);
  const callNum = b.emergency_phone || phones[0];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <a href={`/${locale}/blood-banks/${b.slug}`} className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
            {district && <span>📍 {district}</span>}
            {b.is_24hr && <span className="font-bold text-red-600">24h</span>}
            {b.open_now === true && <span className="font-medium text-green-600">{ml ? 'തുറന്നത്' : 'Open'}</span>}
          </div>
        </a>
      </div>
      <div className="mt-2"><BloodTypeBadges types={b.blood_types_available} /></div>
      {callNum && (
        <a href={`tel:${callNum}`} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-base font-bold text-white hover:bg-red-700">
          📞 {ml ? 'വിളിക്കുക' : 'Call'} {callNum}
        </a>
      )}
    </div>
  );
}
