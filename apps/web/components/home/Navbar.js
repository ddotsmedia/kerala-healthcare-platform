'use client';

// Sticky top navigation. White, gains shadow on scroll. Desktop inline links,
// mobile hamburger + slide-out drawer.
import { useEffect, useState } from 'react';
import Link from 'next/link';

const BRAND = { ml: 'മലയാളി ഡോക്ടർ', en: 'MalayaliDoctor' };

const LINKS = [
  { href: 'doctors', ml: 'ഡോക്ടർമാർ', en: 'Doctors' },
  { href: 'hospitals', ml: 'ആശുപത്രികൾ', en: 'Hospitals' },
  { href: 'health', ml: 'ആരോഗ്യ വിവരം', en: 'Health Info' },
  { href: 'symptoms', ml: 'ലക്ഷണങ്ങൾ', en: 'Symptoms' },
  { href: 'jobs', ml: 'ജോലികൾ', en: 'Jobs' },
  { href: 'tools', ml: 'ഹെൽത്ത് ടൂളുകൾ', en: 'Health Tools' },
  { href: 'assistant', ml: 'AI അസിസ്റ്റന്റ്', en: 'AI Assistant' }
];

export default function Navbar({ locale = 'ml' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const other = locale === 'ml' ? 'en' : 'ml';
  const L = (l) => (locale === 'ml' ? l.ml : l.en);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="text-lg font-extrabold text-brand">
          {BRAND[locale] || BRAND.en}
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-700 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={`/${locale}/${l.href}`} className="hover:text-brand">{L(l)}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/emergency`}
            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
          >
            🚨 {locale === 'ml' ? 'അടിയന്തരം' : 'Emergency'}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="hidden rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark sm:inline-block"
          >
            {locale === 'ml' ? 'ലോഗിൻ' : 'Login'}
          </Link>
          <Link href={`/${other}`} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:border-brand hover:text-brand">
            {locale === 'ml' ? 'EN' : 'ML'}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Menu"
            className="rounded-lg border border-gray-300 p-2 text-gray-700 lg:hidden"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-brand">{BRAND[locale] || BRAND.en}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-gray-500">✕</button>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {LINKS.map((l) => (
                <Link key={l.href} href={`/${locale}/${l.href}`} onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  {L(l)}
                </Link>
              ))}
              <Link href={`/${locale}/login`} onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-dark">
                {locale === 'ml' ? 'ലോഗിൻ' : 'Login'}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
