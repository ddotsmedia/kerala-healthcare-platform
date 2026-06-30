// SpecialtyFilter.js — single-select specialty dropdown with Malayalam labels.
// Server-render friendly (plain <select> in a GET form; no client state).

const LABEL = { ml: 'സ്പെഷ്യാലിറ്റി', en: 'Specialty' };
const ALL = { ml: 'എല്ലാം', en: 'All' };

export default function SpecialtyFilter({ specialties = [], selected, locale = 'ml', name = 'specialty' }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{LABEL[locale] || LABEL.en}</span>
      <select name={name} defaultValue={selected || ''} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="">{ALL[locale] || ALL.en}</option>
        {specialties.map((s) => (
          <option key={s.id} value={s.id}>{locale === 'ml' ? s.name_ml : s.name_en}</option>
        ))}
      </select>
    </label>
  );
}
