// DistrictFilter.js — district dropdown (all 14 Kerala districts) ml+en.
// Server-render friendly (plain <select> in a GET form).

const LABEL = { ml: 'ജില്ല', en: 'District' };
const ALL = { ml: 'എല്ലാ ജില്ലകളും', en: 'All districts' };

export default function DistrictFilter({ districts = [], selected, locale = 'ml', name = 'district' }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{LABEL[locale] || LABEL.en}</span>
      <select name={name} defaultValue={selected || ''} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="">{ALL[locale] || ALL.en}</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{locale === 'ml' ? d.name_ml : d.name_en}</option>
        ))}
      </select>
    </label>
  );
}
