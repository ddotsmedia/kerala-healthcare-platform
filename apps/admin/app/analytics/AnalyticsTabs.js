'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/analytics', label: 'Overview' },
  { href: '/analytics/search', label: 'Search' },
  { href: '/analytics/providers', label: 'Providers' },
  { href: '/analytics/content', label: 'Content' },
  { href: '/analytics/revenue', label: 'Revenue' },
  { href: '/analytics/ai', label: 'AI' }
];

export default function AnalyticsTabs() {
  const pathname = usePathname() || '';
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2 p-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? 'bg-surface text-brand shadow-sm' : 'text-ink-soft hover:text-ink'}`}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
