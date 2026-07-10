// EquipmentCard.js — medical equipment supplier directory item: type, category
// badges, service badges, district, phone. Server component.

const TYPE_LABELS = {
  supplier: { ml: 'വിതരണക്കാരൻ', en: 'Supplier' },
  rental: { ml: 'വാടക', en: 'Rental' },
  repair: { ml: 'റിപ്പയർ', en: 'Repair' }
};
const CAT_LABELS = {
  mobility: { ml: 'മൊബിലിറ്റി', en: 'Mobility' }, respiratory: { ml: 'ശ്വസനം', en: 'Respiratory' },
  monitoring: { ml: 'മോണിറ്ററിംഗ്', en: 'Monitoring' }, rehabilitation: { ml: 'പുനരധിവാസം', en: 'Rehabilitation' },
  hospital_furniture: { ml: 'ആശുപത്രി ഫർണിച്ചർ', en: 'Hospital furniture' }, orthotics: { ml: 'ഓർത്തോട്ടിക്സ്', en: 'Orthotics' },
  prosthetics: { ml: 'പ്രോസ്തെറ്റിക്സ്', en: 'Prosthetics' }
};

export default function EquipmentCard({ supplier: e, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? e.name_ml : e.name_en) || e.name_en;
  const district = ml ? e.district_ml : e.district_en;
  const type = TYPE_LABELS[e.type];
  const cats = Array.isArray(e.equipment_categories) ? e.equipment_categories : [];
  const phone = Array.isArray(e.phone) ? e.phone[0] : e.phone;
  return (
    <a href={`/${locale}/medical-equipment/${e.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {type && <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{type[locale] || type.en}</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        {phone && <span>📞 {phone}</span>}
      </div>
      {cats.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {cats.slice(0, 4).map((c) => { const l = CAT_LABELS[c]; return <span key={c} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{l ? (l[locale] || l.en) : c}</span>; })}
          {cats.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{cats.length - 4}</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-500">
        {e.has_rental && <span className="font-medium text-brand">🛏️ {ml ? 'വാടക' : 'Rental'}</span>}
        {e.has_delivery && <span>🚚 {ml ? 'ഡെലിവറി' : 'Delivery'}</span>}
        {e.has_installation && <span>🔧 {ml ? 'ഇൻസ്റ്റാളേഷൻ' : 'Installation'}</span>}
        {e.has_repair_service && <span>🛠️ {ml ? 'റിപ്പയർ' : 'Repair'}</span>}
      </div>
    </a>
  );
}
