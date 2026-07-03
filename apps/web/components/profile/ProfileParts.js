// ProfileParts.js — shared profile UI (server): avatar, breadcrumb, mode icons.

import Link from 'next/link';
import { SITE } from '@/lib/schema';

export const MODE_META = {
  in_person: { icon: '🏥', ml: 'നേരിട്ട്', en: 'In-person' },
  video: { icon: '🎥', ml: 'വീഡിയോ', en: 'Video' },
  phone: { icon: '📞', ml: 'ഫോൺ', en: 'Phone' }
};

export function initials(name = '') {
  const parts = String(name).replace(/^dr\.?\s*/i, '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '·';
}

export function Avatar({ src, name, size = 'lg' }) {
  const dim = size === 'lg' ? 'h-24 w-24 text-2xl' : 'h-14 w-14 text-base';
  if (src) return <img src={src} alt={name ? `${name}` : ''} loading="lazy" decoding="async" className={`${dim} shrink-0 rounded-2xl object-cover`} />;
  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-2xl bg-teal-100 font-bold text-brand`}>
      {initials(name)}
    </div>
  );
}

export function ModeIcons({ modes = [], locale = 'ml' }) {
  if (!modes.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {modes.map((m) => {
        const meta = MODE_META[m];
        if (!meta) return null;
        return (
          <span key={m} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-brand">
            <span aria-hidden="true">{meta.icon}</span> {locale === 'ml' ? meta.ml : meta.en}
          </span>
        );
      })}
    </div>
  );
}

export function Chip({ children, tone = 'teal' }) {
  const tones = {
    teal: 'bg-teal-50 text-brand',
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700'
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

/** Verification badge: green verified / amber pending. */
export function StatusBadge({ status, locale = 'ml' }) {
  const ok = status === 'verified';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
      {ok ? '✓' : '⏳'} {ok ? (locale === 'ml' ? 'വെരിഫൈഡ്' : 'Verified') : (locale === 'ml' ? 'പെൻഡിംഗ്' : 'Pending')}
    </span>
  );
}

/** Breadcrumb for profile pages (dark text) + BreadcrumbList JSON-LD. */
export function ProfileBreadcrumb({ items = [] }) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name,
      ...(it.href ? { item: `${SITE}${it.href}` } : {})
    }))
  };
  return (
    <nav aria-label="breadcrumb" className="text-xs text-gray-500">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? <Link href={it.href} className="hover:text-brand">{it.name}</Link> : <span className="font-medium text-gray-700">{it.name}</span>}
            {i < items.length - 1 && <span aria-hidden="true">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>}
      {children}
    </section>
  );
}
