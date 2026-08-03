// MedicineCard — generic name, drug class, OTC/prescription badge, brands.

import Link from 'next/link';

export default function MedicineCard({ medicine, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? medicine.generic_name_ml : medicine.generic_name_en) || medicine.generic_name_en;
  const brands = Array.isArray(medicine.brand_names) ? medicine.brand_names.slice(0, 3) : [];

  return (
    <Link href={`/${locale}/medicines/${medicine.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-brand">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{name}</h3>
          {medicine.generic_name_en !== name && <p className="truncate text-xs text-gray-400">{medicine.generic_name_en}</p>}
          {medicine.drug_class && <p className="mt-0.5 text-xs text-gray-500">{medicine.drug_class}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${medicine.is_otc ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          {medicine.is_otc ? (ml ? 'OTC' : 'OTC') : (ml ? 'കുറിപ്പടി' : 'Rx')}
        </span>
      </div>
      {brands.length > 0 && (
        <p className="mt-2 truncate text-xs text-gray-500">
          {ml ? 'ബ്രാൻഡുകൾ: ' : 'Brands: '}{brands.join(', ')}
        </p>
      )}
    </Link>
  );
}
