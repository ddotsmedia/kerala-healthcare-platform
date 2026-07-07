// LabCard.js — diagnostic-lab directory item: name, NABL + home-collection badges,
// rating, district, tap-to-call. Server component (no contact protection needed).

const TYPE_LABELS = {
  pathology: { ml: 'പാത്തോളജി', en: 'Pathology' },
  radiology: { ml: 'റേഡിയോളജി', en: 'Radiology' },
  imaging: { ml: 'ഇമേജിംഗ്', en: 'Imaging' },
  'multi-specialty': { ml: 'മൾട്ടി-സ്പെഷ്യാലിറ്റി', en: 'Multi-specialty' }
};

export default function LabCard({ lab, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? lab.name_ml : lab.name_en) || lab.name_en;
  const district = (ml ? lab.district_ml : lab.district_en);
  const type = TYPE_LABELS[lab.type];
  const phone = Array.isArray(lab.phone) ? lab.phone[0] : lab.phone;
  return (
    <a href={`/${locale}/labs/${lab.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {lab.is_nabl_accredited && <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">NABL</span>}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
        {type && <span>{type[locale] || type.en}</span>}
        {district && <span>📍 {district}</span>}
        {lab.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(lab.rating_avg).toFixed(1)} ({lab.rating_count})</span>}
        {lab.open_now === true && <span className="font-medium text-green-600">{ml ? 'ഇപ്പോൾ തുറന്നിരിക്കുന്നു' : 'Open now'}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {lab.home_collection && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">🏠 {ml ? 'ഹോം കളക്ഷൻ' : 'Home collection'}</span>}
        {lab.online_reports && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">📄 {ml ? 'ഓൺലൈൻ റിപ്പോർട്ട്' : 'Online reports'}</span>}
        {phone && <span className="ml-auto text-xs font-medium text-gray-500">📞 {phone}</span>}
      </div>
    </a>
  );
}
