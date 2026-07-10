// CrisisBanner.js — non-dismissable mental-health crisis helplines. Always visible
// on mental-health pages. Compassionate, tap-to-call. Server component.

const LINES = [
  { n: '9152987821', label_ml: 'iCall (തിങ്കൾ–ശനി 8AM–10PM)', label_en: 'iCall (Mon–Sat 8AM–10PM)' },
  { n: '18602662345', display: '1860-2662-345', label_ml: 'വന്ദ്രേവാല ഫൗണ്ടേഷൻ (24x7)', label_en: 'Vandrevala Foundation (24x7)' },
  { n: '104', label_ml: 'ദിശ ഹെൽപ്‌ലൈൻ (കേരള)', label_en: 'DISHA Helpline (Kerala)' }
];

export default function CrisisBanner({ locale = 'ml' }) {
  const ml = locale === 'ml';
  return (
    <section role="note" aria-label="crisis-helplines" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-900">
        💙 {ml ? 'നിങ്ങൾ ഒറ്റയ്ക്കല്ല. ഇപ്പോൾ സഹായം ലഭ്യമാണ് — സൗജന്യ, രഹസ്യ ഹെൽപ്‌ലൈനുകൾ:' : 'You are not alone. Help is available now — free, confidential helplines:'}
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LINES.map((x) => (
          <a key={x.n} href={`tel:${x.n}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm hover:bg-rose-100">
            <span className="text-xs font-medium text-gray-700">{ml ? x.label_ml : x.label_en}</span>
            <span className="text-sm font-bold text-rose-700">📞 {x.display || x.n}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
