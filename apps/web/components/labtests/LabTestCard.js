// LabTestCard — name, abbreviation, category, preparation-required badge.

import Link from 'next/link';

const CAT_LABEL = {
  blood: ['രക്തം', 'Blood'], urine: ['മൂത്രം', 'Urine'], imaging: ['ഇമേജിംഗ്', 'Imaging'],
  heart: ['ഹൃദയം', 'Heart'], hormones: ['ഹോർമോണുകൾ', 'Hormones'],
  infection: ['അണുബാധ', 'Infection'], cancer: ['കാൻസർ മാർക്കർ', 'Cancer Marker']
};

export default function LabTestCard({ test, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? test.name_ml : test.name_en) || test.name_en;
  const cat = CAT_LABEL[test.category];

  return (
    <Link href={`/${locale}/lab-tests/${test.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-brand">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{name}</h3>
          {test.name_en !== name && <p className="truncate text-xs text-gray-400">{test.name_en}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {test.abbreviation && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold text-gray-700">{test.abbreviation}</span>}
            {cat && <span className="text-xs text-gray-500">{ml ? cat[0] : cat[1]}</span>}
          </div>
        </div>
        {test.prep_required && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {ml ? 'തയ്യാറെടുപ്പ്' : 'Prep'}
          </span>
        )}
      </div>
    </Link>
  );
}
