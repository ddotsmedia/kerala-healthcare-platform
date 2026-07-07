// PharmacyCard.js — pharmacy directory item: name, 24hr/delivery/generic badges,
// rating, district, phone. Server component.

const TYPE_LABELS = {
  retail: { ml: 'റീട്ടെയിൽ', en: 'Retail' },
  hospital: { ml: 'ആശുപത്രി', en: 'Hospital' },
  online: { ml: 'ഓൺലൈൻ', en: 'Online' },
  generic: { ml: 'ജനറിക്', en: 'Generic' }
};

export default function PharmacyCard({ pharmacy: p, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? p.name_ml : p.name_en) || p.name_en;
  const district = ml ? p.district_ml : p.district_en;
  const type = TYPE_LABELS[p.type];
  const phone = Array.isArray(p.phone) ? p.phone[0] : p.phone;
  return (
    <a href={`/${locale}/pharmacies/${p.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {p.is_24hr && <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">24h</span>}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
        {type && <span>{type[locale] || type.en}</span>}
        {district && <span>📍 {district}</span>}
        {p.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(p.rating_avg).toFixed(1)} ({p.rating_count})</span>}
        {p.open_now === true && <span className="font-medium text-green-600">{ml ? 'ഇപ്പോൾ തുറന്നത്' : 'Open now'}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {p.has_delivery && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">🛵 {ml ? 'ഡെലിവറി' : 'Delivery'}</span>}
        {p.sells_generic && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">💊 {ml ? 'ജനറിക്' : 'Generic'}</span>}
        {p.has_cold_storage && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">❄️ {ml ? 'കോൾഡ് സ്റ്റോറേജ്' : 'Cold storage'}</span>}
        {phone && <span className="ml-auto text-xs font-medium text-gray-500">📞 {phone}</span>}
      </div>
    </a>
  );
}
