// Emergency — fast, no DB. Tap-to-call numbers + first-aid guide.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'അടിയന്തര സഹായം | MalayaliDoctor' : 'Emergency Help | MalayaliDoctor' };
}

const NUMBERS = [
  { n: '112', icon: '📞', ml: 'ദേശീയ അടിയന്തരം', en: 'National Emergency' },
  { n: '108', icon: '🚑', ml: 'ആംബുലൻസ് (കേരള)', en: 'Ambulance (Kerala)' },
  { n: '104', icon: '🏥', ml: 'ആരോഗ്യ ഹെൽപ്‌ലൈൻ', en: 'Health Helpline' },
  { n: '100', icon: '👮', ml: 'പോലീസ്', en: 'Police' },
  { n: '101', icon: '🔥', ml: 'ഫയർ', en: 'Fire' },
  { n: '1056', icon: '☎️', ml: 'മെഡിക്കൽ ഹെൽപ്‌ലൈൻ', en: 'Medical Helpline' },
  { n: '1091', icon: '👩', ml: 'വനിതാ ഹെൽപ്‌ലൈൻ', en: "Women's Helpline" },
  { n: '181', icon: '🛡️', ml: 'ഗാർഹിക പീഡനം', en: 'Domestic Violence' },
  { n: '1098', icon: '🧒', ml: 'ശിശു ഹെൽപ്‌ലൈൻ', en: 'CHILDLINE' }
];

export default async function EmergencyPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const firstAid = [
    { q: ml ? 'ഹൃദയാഘാതം' : 'Heart attack',
      a: ml ? 'നെഞ്ചുവേദന, കൈ/താടിയെല്ലിലേക്ക് വേദന, വിയർപ്പ്, ശ്വാസതടസ്സം. ഉടൻ 108 വിളിക്കുക. രോഗിയെ ഇരുത്തുക, മുറുകിയ വസ്ത്രം അയയ്ക്കുക. നിർദ്ദേശമുണ്ടെങ്കിൽ ആസ്പിരിൻ ചവയ്ക്കാൻ നൽകുക.' : 'Chest pain, pain to arm/jaw, sweating, breathlessness. Call 108 now. Sit the person down, loosen tight clothing. Give aspirin to chew if advised.' },
    { q: ml ? 'സ്ട്രോക്ക് (FAST)' : 'Stroke (FAST)',
      a: ml ? 'F-മുഖം കോടൽ, A-കൈ ബലഹീനത, S-സംസാരം കുഴയൽ, T-ഉടൻ 108 വിളിക്കാൻ സമയം. ഭക്ഷണം/വെള്ളം നൽകരുത്.' : 'F-face drooping, A-arm weakness, S-speech difficulty, T-time to call 108 now. Do not give food or water.' },
    { q: ml ? 'ശ്വാസംമുട്ടൽ (ഹെയ്‌മ്‌ലിക്)' : 'Choking (Heimlich)',
      a: ml ? 'പുറകിൽ നിന്ന് കൈകൾ വയറിന് ചുറ്റും ചേർത്ത് പൊക്കിളിന് മുകളിൽ വേഗത്തിൽ അകത്തേക്കും മുകളിലേക്കും അമർത്തുക. തടസ്സം മാറുന്നത് വരെ ആവർത്തിക്കുക.' : 'From behind, wrap arms around the abdomen, give quick inward-and-upward thrusts above the navel. Repeat until the object clears.' },
    { q: ml ? 'പൊള്ളൽ' : 'Burns',
      a: ml ? 'പൊള്ളിയ ഭാഗം 20 മിനിറ്റ് തണുത്ത ഒഴുകുന്ന വെള്ളത്തിൽ പിടിക്കുക. ഐസ്, വെണ്ണ, പേസ്റ്റ് ഇടരുത്. വൃത്തിയുള്ള തുണി കൊണ്ട് മൂടുക.' : 'Hold the burn under cool running water for 20 minutes. Do not apply ice, butter or paste. Cover with a clean cloth.' },
    { q: ml ? 'രക്തസ്രാവം' : 'Bleeding',
      a: ml ? 'വൃത്തിയുള്ള തുണി കൊണ്ട് നേരിട്ട് ശക്തമായി അമർത്തുക. സാധ്യമെങ്കിൽ ആ ഭാഗം ഉയർത്തുക. അമർത്തൽ തുടരുക, 108 വിളിക്കുക.' : 'Press firmly and directly with a clean cloth. Raise the area if possible. Keep pressing and call 108.' },
    { q: ml ? 'ബോധരഹിതൻ (റിക്കവറി പൊസിഷൻ)' : 'Unconscious (recovery position)',
      a: ml ? 'ശ്വാസം ഉണ്ടെങ്കിൽ വശം ചരിച്ച് കിടത്തുക, തല അല്പം പിന്നിലേക്ക് ചരിക്കുക. ശ്വാസം ഇല്ലെങ്കിൽ CPR തുടങ്ങുക, 108 വിളിക്കുക.' : 'If breathing, roll onto their side, tilt head back slightly. If not breathing, start CPR and call 108.' }
  ];

  return (
    <div className="-my-6">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-red-600 py-12 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-extrabold sm:text-4xl">🚨 {ml ? 'അടിയന്തരം?' : 'Emergency?'}</h1>
          <p className="mt-2 text-lg font-semibold">{ml ? 'ഉടൻ ഫോൺ ചെയ്യുക' : 'Call immediately'}</p>
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-white py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 px-4 sm:grid-cols-2">
          {NUMBERS.map((x) => (
            <a key={x.n} href={`tel:${x.n}`} aria-label={`Call ${x.n} ${ml ? x.ml : x.en}`}
              className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 hover:border-red-400">
              <span className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{x.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{ml ? x.ml : x.en}</span>
              </span>
              <span className="text-2xl font-extrabold text-red-600">{x.n}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900">{ml ? 'പ്രഥമശുശ്രൂഷ ഗൈഡ്' : 'First Aid Quick Guide'}</h2>
          <div className="space-y-2">
            {firstAid.map((f, i) => (
              <details key={i} className="group rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
                  <span className="mr-2 text-red-600 group-open:hidden">＋</span>
                  <span className="mr-2 hidden text-red-600 group-open:inline">－</span>
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href={`/${locale}/hospitals?service=emergency`}
              className="block rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark">
              🏥 {ml ? 'അടുത്തുള്ള ആശുപത്രി കണ്ടെത്തുക' : 'Find nearest hospital'}
            </Link>
            <Link href={`/${locale}/blood-banks`}
              className="block rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-red-700">
              🩸 {ml ? 'ബ്ലഡ് ബാങ്ക് കണ്ടെത്തുക →' : 'Find Blood Bank →'}
            </Link>
          </div>

          <div role="note" className="mt-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {ml ? 'ഉടനടി അപകടത്തിലാണെങ്കിൽ ആദ്യം 112 വിളിക്കുക. കാത്തിരിക്കരുത്. ഈ പേജ് മാർഗനിർദേശത്തിന് മാത്രം.' : 'If in immediate danger, call 112 first. Do not wait. This page is for guidance only.'}
          </div>
        </div>
      </section>
    </div>
  );
}
