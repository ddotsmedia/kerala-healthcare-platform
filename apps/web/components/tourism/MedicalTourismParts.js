// Static content + presentational parts for the Medical Tourism page.
// Cost figures are approximate, illustrative ranges (USD) — clearly labelled.

export const WHY_KERALA = [
  { icon: '🏅', ml: ['ഗുണനിലവാരം', 'NABH/JCI അംഗീകൃത ആശുപത്രികളും വൈദഗ്ധ്യമുള്ള ഡോക്ടർമാരും.'],
    en: ['World-class quality', 'NABH/JCI-accredited hospitals and highly trained specialists.'] },
  { icon: '💰', ml: ['താങ്ങാവുന്ന ചെലവ്', 'പാശ്ചാത്യ രാജ്യങ്ങളെ അപേക്ഷിച്ച് ചികിത്സാ ചെലവ് വളരെ കുറവ്.'],
    en: ['Affordable care', 'Treatment costs a fraction of those in the UK, US or GCC.'] },
  { icon: '🌿', ml: ['ആയുർവേദ പാരമ്പര്യം', 'ആധുനിക വൈദ്യശാസ്ത്രത്തോടൊപ്പം ആധികാരിക ആയുർവേദവും.'],
    en: ['Ayurveda tradition', 'Authentic Ayurveda alongside modern medicine.'] },
  { icon: '🗣️', ml: ['ഭാഷാ സൗകര്യം', 'ഇംഗ്ലീഷ് വ്യാപകമായി സംസാരിക്കുന്നു; ഉയർന്ന സാക്ഷരത.'],
    en: ['Easy communication', 'English widely spoken; India’s highest literacy state.'] }
];

export const TREATMENTS = [
  { icon: '🫀', ml: 'ഹൃദയ ചികിത്സ', en: 'Cardiac care' },
  { icon: '🦴', ml: 'ഓർത്തോപീഡിക്സ്', en: 'Orthopedics' },
  { icon: '🎗️', ml: 'കാൻസർ ചികിത്സ', en: 'Cancer care' },
  { icon: '🌿', ml: 'ആയുർവേദം', en: 'Ayurveda' },
  { icon: '🦷', ml: 'ദന്ത ചികിത്സ', en: 'Dental' },
  { icon: '✨', ml: 'സൗന്ദര്യ ശസ്ത്രക്രിയ', en: 'Cosmetic' }
];

// Approximate, illustrative cost ranges in USD. Not a quotation.
export const COST_ROWS = [
  { proc: { ml: 'ഹൃദയ ബൈപാസ് (CABG)', en: 'Heart bypass (CABG)' }, india: '$5k–8k', uk: '$30k–40k', us: '$70k–130k', gcc: '$25k–35k' },
  { proc: { ml: 'കാൽമുട്ട് മാറ്റിവയ്ക്കൽ', en: 'Knee replacement' }, india: '$4k–6k', uk: '$18k–25k', us: '$30k–50k', gcc: '$15k–22k' },
  { proc: { ml: 'ഇടുപ്പ് മാറ്റിവയ്ക്കൽ', en: 'Hip replacement' }, india: '$4k–7k', uk: '$20k–28k', us: '$30k–60k', gcc: '$16k–24k' },
  { proc: { ml: 'ദന്ത ഇംപ്ലാന്റ് (ഒന്ന്)', en: 'Dental implant (one)' }, india: '$400–800', uk: '$2k–3k', us: '$3k–5k', gcc: '$1.5k–2.5k' }
];

export const MEDICAL_VISA_URL = 'https://indianvisaonline.gov.in/';

export function WhyGrid({ locale }) {
  const ml = locale === 'ml';
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {WHY_KERALA.map((w, i) => {
        const [title, body] = ml ? w.ml : w.en;
        return (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-2xl">{w.icon}</div>
            <h3 className="mt-1 text-sm font-bold text-gray-900">{title}</h3>
            <p className="mt-0.5 text-xs text-gray-600">{body}</p>
          </div>
        );
      })}
    </div>
  );
}

export function TreatmentGrid({ locale }) {
  const ml = locale === 'ml';
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TREATMENTS.map((t) => (
        <div key={t.en} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3">
          <span className="text-xl" aria-hidden="true">{t.icon}</span>
          <span className="text-sm font-medium text-gray-800">{ml ? t.ml : t.en}</span>
        </div>
      ))}
    </div>
  );
}

export function CostTable({ locale }) {
  const ml = locale === 'ml';
  const th = 'px-3 py-2 text-left text-xs font-semibold text-gray-600';
  const td = 'px-3 py-2 text-sm text-gray-800 whitespace-nowrap';
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className={th}>{ml ? 'ചികിത്സ' : 'Procedure'}</th>
            <th className={`${th} text-brand`}>{ml ? 'ഇന്ത്യ (കേരളം)' : 'India (Kerala)'}</th>
            <th className={th}>UK</th>
            <th className={th}>US</th>
            <th className={th}>GCC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {COST_ROWS.map((r) => (
            <tr key={r.proc.en}>
              <td className={`${td} font-medium`}>{ml ? r.proc.ml : r.proc.en}</td>
              <td className={`${td} font-bold text-brand`}>{r.india}</td>
              <td className={td}>{r.uk}</td>
              <td className={td}>{r.us}</td>
              <td className={td}>{r.gcc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
