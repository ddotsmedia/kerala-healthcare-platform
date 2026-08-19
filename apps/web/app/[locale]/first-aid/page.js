// First Aid Guide — fully hardcoded (no DB) so it works even during server/DB
// issues. Large text, high contrast, numbered steps. Malayalam-first.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { FIRST_AID, FA_CATEGORIES } from '@/components/firstaid/firstAidData';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'പ്രഥമശുശ്രൂഷ — First Aid Guide | MalayaliDoctor' : 'First Aid Guide | MalayaliDoctor',
    description: ml
      ? '30+ അടിയന്തര സാഹചര്യങ്ങൾക്കുള്ള ലളിതമായ പ്രഥമശുശ്രൂഷ നിർദ്ദേശങ്ങൾ. ജീവൻ രക്ഷിക്കുന്ന വിവരങ്ങൾ.'
      : 'Simple, step-by-step first-aid instructions for 30+ emergencies. Life-saving information.'
  };
}

function EmergencyBanner({ ml }) {
  const item = (num, labelMl, labelEn, cls) => (
    <a href={`tel:${num}`} className={`flex flex-1 flex-col items-center rounded-xl px-3 py-3 text-white ${cls}`}>
      <span className="text-2xl font-extrabold">{num}</span>
      <span className="text-xs font-semibold">{ml ? labelMl : labelEn}</span>
    </a>
  );
  return (
    <div className="sticky top-0 z-30 bg-red-700 px-3 py-3 shadow-lg">
      <div className="mx-auto flex max-w-3xl gap-2">
        {item('112', 'അടിയന്തരം', 'Emergency', 'bg-red-600')}
        {item('108', 'ആംബുലൻസ്', 'Ambulance', 'bg-red-800')}
        {item('1056', 'വിഷ വിവരം', 'Poison Info', 'bg-rose-900')}
      </div>
    </div>
  );
}

function Situation({ s, ml }) {
  const name = ml ? s.name_ml : s.name_en;
  const signs = ml ? s.signs_ml : s.signs_en;
  const steps = ml ? s.steps_ml : s.steps_en;
  const donts = ml ? s.donts_ml : s.donts_en;
  return (
    <article id={s.slug} className="scroll-mt-24 rounded-2xl border-2 border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-extrabold text-gray-900">{name}</h3>
        <a href={`tel:${s.call}`} className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">📞 {s.call}</a>
      </div>
      {signs?.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{ml ? 'തിരിച്ചറിയാൻ' : 'Signs'}</p>
          <p className="text-sm text-gray-700">{signs.join(' · ')}</p>
        </div>
      )}
      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{ml ? 'ചെയ്യേണ്ടത്' : 'What to do'}</p>
        <ol className="mt-1 space-y-1.5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-base leading-snug text-gray-900">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {donts?.length > 0 && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-red-700">{ml ? 'ചെയ്യരുത്' : 'Do NOT'}</p>
          <ul className="mt-0.5 list-disc pl-5 text-sm text-red-800">
            {donts.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}

export default async function FirstAidPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const cats = FA_CATEGORIES.filter((c) => FIRST_AID.some((s) => s.category === c.key));

  return (
    <div className="-my-6 pb-10">
      <EmergencyBanner ml={ml} />

      <div className="mx-auto max-w-3xl px-4">
        <header className="py-5 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">🚑 {ml ? 'പ്രഥമശുശ്രൂഷ' : 'First Aid Guide'}</h1>
          <p className="mt-1 text-sm text-gray-600">{ml ? 'അടിയന്തര ഘട്ടത്തിൽ ശാന്തമായി ഈ ഘട്ടങ്ങൾ പിന്തുടരുക' : 'Stay calm and follow these steps in an emergency'}</p>
        </header>

        {/* Category quick-nav (anchor links) */}
        <nav className="flex flex-wrap gap-2 pb-4" aria-label={ml ? 'വിഭാഗങ്ങൾ' : 'Categories'}>
          {cats.map((c) => (
            <a key={c.key} href={`#cat-${c.key}`} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-brand hover:text-brand">
              {c.icon} {ml ? c.ml : c.en}
            </a>
          ))}
        </nav>

        {cats.map((c) => (
          <section key={c.key} id={`cat-${c.key}`} className="scroll-mt-24 pb-6">
            <h2 className="mb-3 text-xl font-bold text-gray-900">{c.icon} {ml ? c.ml : c.en}</h2>
            <div className="space-y-3">
              {FIRST_AID.filter((s) => s.category === c.key).map((s) => <Situation key={s.slug} s={s} ml={ml} />)}
            </div>
          </section>
        ))}

        <div role="note" className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          {ml
            ? 'ഈ ഗൈഡ് അടിസ്ഥാന പ്രഥമശുശ്രൂഷയ്ക്ക് മാത്രം — ഇത് വൈദ്യസഹായത്തിന് പകരമല്ല. അടിയന്തര ഘട്ടത്തിൽ എപ്പോഴും 112 അല്ലെങ്കിൽ ആംബുലൻസിന് 108 വിളിക്കുക.'
            : 'This guide is basic first aid only — it is not a substitute for medical care. In an emergency always call 112, or 108 for an ambulance.'}
        </div>

        <div className="mt-4 text-center">
          <Link href={`/${locale}/emergency`} className="text-sm font-semibold text-brand hover:underline">
            {ml ? '← അടിയന്തര സേവനങ്ങളിലേക്ക്' : '← Back to Emergency services'}
          </Link>
        </div>
      </div>
    </div>
  );
}
