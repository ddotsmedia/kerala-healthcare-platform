// HubParts.js — shared health-hub UI (server).

import Link from 'next/link';

export function HubHero({ title, subtitle, gradient = 'from-[#0d9488] to-[#0f766e]', large = false }) {
  return (
    <section className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gradient-to-br ${gradient} py-12 text-white sm:py-16`}>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className={`font-extrabold ${large ? 'text-3xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}>{title}</h1>
        {subtitle && <p className={`mt-3 text-white/90 ${large ? 'text-lg' : 'text-sm sm:text-base'}`}>{subtitle}</p>}
      </div>
    </section>
  );
}

/** items: [{ icon, ml, en, href }] */
export function TopicGrid({ items = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it, i) => (
        <Link key={i} href={it.href}
          className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-3xl" aria-hidden="true">{it.icon}</span>
          <span className="mt-2 text-sm font-semibold text-gray-900">{ml ? it.ml : it.en}</span>
          {it.en && ml && <span className="text-xs text-gray-500">{it.en}</span>}
        </Link>
      ))}
    </div>
  );
}

/** Crisis / helpline band. lines: [{ label, number }] */
export function HelplineBand({ title, lines = [], tone = 'red' }) {
  const bg = tone === 'red' ? 'bg-red-600' : 'bg-brand';
  return (
    <section className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${bg} py-4 text-white`}>
      <div className="mx-auto max-w-4xl px-4 text-center text-sm font-semibold">
        {title && <span className="mr-2">{title}</span>}
        {lines.map((l, i) => (
          <span key={i} className="mx-1 inline-block">
            {l.label} <a href={`tel:${String(l.number).replace(/[^0-9]/g, '')}`} className="underline">{l.number}</a>
            {i < lines.length - 1 ? ' ·' : ''}
          </span>
        ))}
      </div>
    </section>
  );
}

export function Disclaimer({ children }) {
  return (
    <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
      {children}
    </div>
  );
}
