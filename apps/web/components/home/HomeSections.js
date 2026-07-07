// Presentational homepage sections (server components). Data-backed sections
// (specialties, districts, doctors, hospitals, articles) live in page.js.

import Link from 'next/link';

// Full-width breakout so coloured bands span the viewport even though the
// locale layout centres content in a narrow column.
export function FullBleed({ className = '', children }) {
  return (
    <section className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}>
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  );
}

export function SectionHeading({ children, sub }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}

const QUICK_LINKS = [
  { icon: '❤️', ml: 'കാർഡിയോളജി', en: 'Cardiology' },
  { icon: '🧠', ml: 'ന്യൂറോളജി', en: 'Neurology' },
  { icon: '🦷', ml: 'ദന്തചികിത്സ', en: 'Dentistry' },
  { icon: '👶', ml: 'ശിശുരോഗം', en: 'Pediatrics' },
  { icon: '🦴', ml: 'ഓർത്തോപീഡിക്സ്', en: 'Orthopedics' },
  { icon: '👁️', ml: 'നേത്രരോഗം', en: 'Ophthalmology' },
  { icon: '🧬', ml: 'ഓങ്കോളജി', en: 'Oncology' },
  { icon: '🧘', ml: 'ആയുർവേദം', en: 'Ayurveda' }
];

const SPECIALTY_ICONS = [
  ['cardio', '❤️'], ['derma', '🩹'], ['neuro', '🧠'], ['ortho', '🦴'],
  ['pediatr', '👶'], ['gyneco', '🤰'], ['obstet', '🤰'], ['ophthal', '👁️'],
  ['dent', '🦷'], ['psychiatr', '🧠'], ['ayurved', '🌿'], ['homeo', '💧'],
  ['onco', '🎗️'], ['ent', '👂'], ['nephro', '🫘'], ['pulmo', '🫁'],
  ['gastro', '🩻'], ['general', '🩺']
];

export function specialtyIcon(nameEn = '') {
  const n = nameEn.toLowerCase();
  const hit = SPECIALTY_ICONS.find(([k]) => n.includes(k));
  return hit ? hit[1] : '🩺';
}

export function Hero({ locale }) {
  const ml = locale === 'ml';
  return (
    <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-14 text-white sm:py-20">
      <div className="text-center">
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
          {ml ? 'കേരളത്തിലെ മികച്ച ഡോക്ടറെ കണ്ടെത്തൂ' : 'Find the best doctor in Kerala'}
        </h1>
        <p className="mt-3 text-sm font-medium text-white/90 sm:text-base">
          {ml
            ? '10,000+ ഡോക്ടർമാർ · 500+ ആശുപത്രികൾ · 14 ജില്ലകൾ'
            : '10,000+ Doctors · 500+ Hospitals · 14 Districts'}
        </p>

        <form action={`/${locale}/search`} method="get"
          className="mx-auto mt-6 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row">
          <input
            type="search" name="q"
            placeholder={ml ? 'ഡോക്ടർ, സ്പെഷ്യാലിറ്റി, ജില്ല...' : 'Doctor, specialty, district...'}
            className="w-full rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none"
            aria-label={ml ? 'തിരയുക' : 'Search'}
          />
          <button type="submit"
            className="shrink-0 rounded-xl bg-[#0f766e] px-6 py-3 text-base font-semibold text-white hover:bg-[#115e56]">
            {ml ? 'തിരയുക' : 'Search'}
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((q) => (
            <Link key={q.en} href={`/${locale}/doctors?q=${encodeURIComponent(q.en)}`}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25">
              <span aria-hidden="true">{q.icon}</span> {ml ? q.ml : q.en}
            </Link>
          ))}
        </div>
      </div>
    </FullBleed>
  );
}

export function StatsBar({ locale }) {
  const ml = locale === 'ml';
  const stats = [
    { n: '10,000+', ml: 'ഡോക്ടർമാർ', en: 'Doctors' },
    { n: '500+', ml: 'ആശുപത്രികൾ', en: 'Hospitals' },
    { n: '200+', ml: 'ലാബുകൾ', en: 'Labs' },
    { n: '14', ml: 'ജില്ലകൾ', en: 'Districts' }
  ];
  return (
    <FullBleed className="bg-teal-50 py-8">
      <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.en}>
            <div className="text-2xl font-extrabold text-brand sm:text-3xl">{s.n}</div>
            <div className="mt-0.5 text-sm text-gray-600">{ml ? s.ml : s.en}</div>
          </div>
        ))}
      </div>
    </FullBleed>
  );
}

export function HowItWorks({ locale }) {
  const ml = locale === 'ml';
  const steps = [
    { icon: '🔍', ml: 'ഡോക്ടറെ തിരയുക', en: 'Search by name, specialty, or district' },
    { icon: '📅', ml: 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക', en: 'Choose a slot and confirm' },
    { icon: '🏥', ml: 'കൺസൾട്ടേഷൻ', en: 'Visit in-person or online' }
  ];
  return (
    <FullBleed className="bg-gray-50 py-14">
      <SectionHeading>{ml ? 'എങ്ങനെ ഉപയോഗിക്കാം' : 'How it works'}</SectionHeading>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl">{s.icon}</div>
            <div className="mt-3 text-base font-semibold text-gray-900">{i + 1}. {ml ? s.ml : s.en}</div>
            <p className="mt-1 text-sm text-gray-500">{s.en}</p>
          </div>
        ))}
      </div>
    </FullBleed>
  );
}

export function ToolsAndAI({ locale }) {
  const ml = locale === 'ml';
  return (
    <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-14 text-white">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
          <div className="text-3xl">🤖</div>
          <h3 className="mt-2 text-lg font-bold">{ml ? 'AI ഹെൽത്ത് അസിസ്റ്റന്റ്' : 'AI Health Assistant'}</h3>
          <p className="mt-1 text-sm text-white/85">
            {ml ? 'ആരോഗ്യ സംശയങ്ങൾക്ക് ഉടൻ ഉത്തരം നേടൂ' : 'Get instant answers to health questions'}
          </p>
          <Link href={`/${locale}/assistant`} className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] hover:bg-white/90">
            {ml ? 'ചോദിക്കൂ →' : 'Ask →'}
          </Link>
        </div>
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
          <div className="text-3xl">🧮</div>
          <h3 className="mt-2 text-lg font-bold">{ml ? 'ഹെൽത്ത് കാൽക്കുലേറ്ററുകൾ' : 'Health Calculators'}</h3>
          <p className="mt-1 text-sm text-white/85">
            {ml ? 'BMI, പ്രസവ തീയതി, വാട്ടർ ഇൻടേക്ക്' : 'BMI, due date, water intake'}
          </p>
          <Link href={`/${locale}/tools`} className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] hover:bg-white/90">
            {ml ? 'ഉപകരണങ്ങൾ →' : 'Tools →'}
          </Link>
        </div>
      </div>
    </FullBleed>
  );
}
