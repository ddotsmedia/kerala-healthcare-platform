// ConsultationModeFilter.js — consultation mode + language dropdowns.
// Two small server-render selects used on the doctor directory filter bar.

const MODE_LABEL = { ml: 'കൺസൾട്ടേഷൻ', en: 'Mode' };
const MODES = [
  { v: 'in_person', ml: 'നേരിട്ട്', en: 'In-person' },
  { v: 'video', ml: 'വീഡിയോ', en: 'Video' },
  { v: 'phone', ml: 'ഫോൺ', en: 'Phone' }
];
const ANY = { ml: 'ഏതും', en: 'Any' };

export default function ConsultationModeFilter({ selected, locale = 'ml', name = 'mode' }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{MODE_LABEL[locale] || MODE_LABEL.en}</span>
      <select name={name} defaultValue={selected || ''} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="">{ANY[locale] || ANY.en}</option>
        {MODES.map((m) => <option key={m.v} value={m.v}>{m[locale] || m.en}</option>)}
      </select>
    </label>
  );
}
