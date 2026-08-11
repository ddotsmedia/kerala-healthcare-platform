// ProcedureCard — name, specialty, stay duration, category.

import Link from 'next/link';

const CAT_LABEL = {
  surgery: ['ശസ്ത്രക്രിയ', 'Surgery'], diagnostic: ['ഡയഗ്നോസ്റ്റിക്', 'Diagnostic'],
  therapeutic: ['ചികിത്സ', 'Therapeutic'], cosmetic: ['സൗന്ദര്യം', 'Cosmetic'], dental: ['ദന്തം', 'Dental']
};

function stayLabel(min, max, ml) {
  if (!max || max === 0) return ml ? 'ഡേ-കെയർ' : 'Day-care';
  if (min === max) return ml ? `${max} ദിവസം` : `${max} day${max > 1 ? 's' : ''}`;
  return ml ? `${min}–${max} ദിവസം` : `${min}–${max} days`;
}

export default function ProcedureCard({ procedure, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? procedure.name_ml : procedure.name_en) || procedure.name_en;
  const specialty = (ml ? procedure.specialty_ml : procedure.specialty_en) || procedure.specialty_en;
  const cat = CAT_LABEL[procedure.category];

  return (
    <Link href={`/${locale}/procedures/${procedure.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-brand">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{name}</h3>
          {procedure.name_en !== name && <p className="truncate text-xs text-gray-400">{procedure.name_en}</p>}
          {specialty && <p className="mt-0.5 text-xs text-gray-500">{specialty}</p>}
        </div>
        {cat && <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-brand">{ml ? cat[0] : cat[1]}</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">🏥 {stayLabel(procedure.hospital_stay_days_min, procedure.hospital_stay_days_max, ml)}</span>
        {procedure.anaesthesia_type && procedure.anaesthesia_type !== 'none' && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">💉 {procedure.anaesthesia_type}</span>
        )}
      </div>
    </Link>
  );
}
