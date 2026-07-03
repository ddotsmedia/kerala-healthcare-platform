// TrustParts.js — shared building blocks for trust/info pages (server components).

import Link from 'next/link';
import { FullBleed } from '@/components/home/HomeSections';

export function TrustHero({ title, subtitle, kicker }) {
  return (
    <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-14 text-white sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        {kicker && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">{kicker}</p>}
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-sm text-white/90 sm:text-base">{subtitle}</p>}
      </div>
    </FullBleed>
  );
}

export function TrustSection({ title, tint = 'white', children }) {
  const bg = tint === 'gray' ? 'bg-gray-50' : tint === 'teal' ? 'bg-teal-50' : 'bg-white';
  return (
    <FullBleed className={`${bg} py-12`}>
      {title && <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">{title}</h2>}
      {children}
    </FullBleed>
  );
}

export function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-2 text-base font-bold text-gray-900">{title}</h3>
      {text && <p className="mt-1 text-sm leading-relaxed text-gray-600">{text}</p>}
    </div>
  );
}

/** Vertical numbered steps (timeline). steps: [{icon,title,text}] */
export function Steps({ steps = [] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg">{s.icon}</div>
          <div>
            <div className="text-sm font-bold text-gray-900">{i + 1}. {s.title}</div>
            {s.text && <p className="mt-0.5 text-sm text-gray-600">{s.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StatStrip({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <div key={i} className="trust-fade rounded-xl bg-white p-4 shadow-sm" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="text-2xl font-extrabold text-brand">{s.value}</div>
          <div className="mt-0.5 text-xs text-gray-600">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Native accordion FAQ (no JS) + FAQPage JSON-LD. items: [{q,a}] */
export function FAQ({ items = [] }) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question', name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a }
    }))
  };
  return (
    <div className="mx-auto max-w-2xl space-y-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {items.map((it, i) => (
        <details key={i} className="group rounded-xl border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
            <span className="mr-2 text-brand group-open:hidden">＋</span>
            <span className="mr-2 hidden text-brand group-open:inline">－</span>
            {it.q}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{it.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ text, buttonLabel, href }) {
  return (
    <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-center text-white">
      <p className="mx-auto max-w-xl text-lg font-semibold">{text}</p>
      <Link href={href} className="mt-4 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0f766e] hover:bg-white/90">
        {buttonLabel}
      </Link>
    </FullBleed>
  );
}

/** Legal/prose document. sections: [{heading, paras:[...]}] */
export function ProseDoc({ title, lastUpdated, intro, sections = [], contactEmail = 'hello@malayalidoctor.com', locale = 'ml' }) {
  const ml = locale === 'ml';
  return (
    <FullBleed className="bg-white py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        {lastUpdated && <p className="mt-1 text-xs text-gray-500">{ml ? 'അവസാനം പുതുക്കിയത്' : 'Last updated'}: {lastUpdated}</p>}
        {intro && <p className="mt-4 text-sm leading-relaxed text-gray-700">{intro}</p>}
        <div className="mt-6 space-y-6">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="mb-2 text-lg font-bold text-gray-900">{s.heading}</h2>
              {s.paras.map((p, j) => (
                Array.isArray(p)
                  ? <ul key={j} className="ml-5 list-disc space-y-1 text-sm leading-relaxed text-gray-700">{p.map((li, k) => <li key={k}>{li}</li>)}</ul>
                  : <p key={j} className="mb-2 text-sm leading-relaxed text-gray-700">{p}</p>
              ))}
            </section>
          ))}
        </div>
        <p className="mt-8 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
          {ml ? 'ചോദ്യങ്ങൾക്ക് ബന്ധപ്പെടുക: ' : 'For concerns, contact: '}
          <a href={`mailto:${contactEmail}`} className="font-medium text-brand hover:underline">{contactEmail}</a>
        </p>
      </div>
    </FullBleed>
  );
}
