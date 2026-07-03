// LandingParts.js — shared SEO landing UI: JSON-LD, breadcrumb, hero, stats.

import Link from 'next/link';

export const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://malayalidoctor.com';

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** items: [{ name, href }] — last item is the current page (no link). */
export function Breadcrumb({ items = [] }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: `${SITE}${it.href}` } : {})
    }))
  };
  return (
    <nav aria-label="breadcrumb" className="text-xs text-white/80">
      <JsonLd data={ld} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? <Link href={it.href} className="hover:underline">{it.name}</Link> : <span className="font-medium text-white">{it.name}</span>}
            {i < items.length - 1 && <span aria-hidden="true">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LandingHero({ icon, breadcrumb, title, subtitle }) {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-10 text-white sm:py-14">
      <div className="mx-auto max-w-6xl px-4">
        {breadcrumb}
        <div className="mt-4 flex items-center gap-3">
          {icon && <span className="text-4xl" aria-hidden="true">{icon}</span>}
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/90">{subtitle}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsRow({ stats = [] }) {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-teal-50 py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="text-xl font-extrabold text-brand sm:text-2xl">{s.value}</div>
            <div className="mt-0.5 text-xs text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionTitle({ children }) {
  return <h2 className="mb-4 text-xl font-bold text-gray-900">{children}</h2>;
}
