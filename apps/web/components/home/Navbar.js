'use client';

// Sticky top navigation. Desktop: Directory dropdown + a few top-level links.
// Mobile: hamburger + slide-out drawer with items grouped under sections.
// Drawer + dropdown close on route change + Escape; 44px touch targets.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BRAND = { ml: 'മലയാളി ഡോക്ടർ', en: 'MalayaliDoctor' };

// Provider directories — grouped under the Directory dropdown.
const DIRECTORY = [
  { href: 'doctors', ml: 'ഡോക്ടർമാർ', en: 'Doctors' },
  { href: 'hospitals', ml: 'ആശുപത്രികൾ', en: 'Hospitals' },
  { href: 'labs', ml: 'ലാബുകൾ', en: 'Labs' },
  { href: 'pharmacies', ml: 'ഫാർമസികൾ', en: 'Pharmacies' },
  { href: 'blood-banks', ml: 'ബ്ലഡ് ബാങ്കുകൾ', en: 'Blood Banks' },
  { href: 'ambulance', ml: 'ആംബുലൻസ്', en: 'Ambulance' },
  { href: 'dental', ml: 'ഡെന്റൽ', en: 'Dental' },
  { href: 'eye-hospitals', ml: 'നേത്ര ആശുപത്രികൾ', en: 'Eye Hospitals' },
  { href: 'physiotherapy', ml: 'ഫിസിയോതെറാപ്പി', en: 'Physiotherapy' },
  { href: 'mental-health-centres', ml: 'മാനസികാരോഗ്യ കേന്ദ്രങ്ങൾ', en: 'Mental Health' },
  { href: 'dialysis', ml: 'ഡയാലിസിസ്', en: 'Dialysis' }
];

// Top-level links (besides Home logo + Emergency button).
const TOP = [
  { href: 'jobs', ml: 'ജോലികൾ', en: 'Jobs' },
  { href: 'health', ml: 'ആരോഗ്യ വിവരം', en: 'Health Info' },
  { href: 'assistant', ml: 'AI അസിസ്റ്റന്റ്', en: 'AI Assistant' }
];

// Secondary links — mobile drawer only (reachable via homepage/footer on desktop).
const MORE = [
  { href: 'symptoms', ml: 'ലക്ഷണങ്ങൾ', en: 'Symptoms' },
  { href: 'tools', ml: 'ഹെൽത്ത് ടൂളുകൾ', en: 'Health Tools' }
];

const HUBS = [
  { href: 'womens-health', ml: 'സ്ത്രീ ആരോഗ്യം', en: "Women's Health" },
  { href: 'mental-health', ml: 'മാനസികാരോഗ്യം', en: 'Mental Health' },
  { href: 'child-health', ml: 'ശിശു ആരോഗ്യം', en: 'Child Health' },
  { href: 'senior-care', ml: 'സീനിയർ കെയർ', en: 'Senior Care' },
  { href: 'vaccination', ml: 'വാക്സിനേഷൻ', en: 'Vaccination' }
];

export default function Navbar({ locale = 'ml' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);      // mobile drawer
  const [dirOpen, setDirOpen] = useState(false); // desktop Directory dropdown
  const pathname = usePathname();
  const dirRef = useRef(null);
  const other = locale === 'ml' ? 'en' : 'ml';
  const ml = locale === 'ml';
  const L = (l) => (ml ? l.ml : l.en);
  const isActive = (href) => pathname === `/${locale}/${href}` || pathname.startsWith(`/${locale}/${href}/`);
  const dirActive = DIRECTORY.some((l) => isActive(l.href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => { setOpen(false); setDirOpen(false); }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open && !dirOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setDirOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dirOpen]);

  // Close the desktop dropdown on outside click.
  useEffect(() => {
    if (!dirOpen) return;
    const onClick = (e) => { if (dirRef.current && !dirRef.current.contains(e.target)) setDirOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [dirOpen]);

  const drawerLink = 'flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium';
  const sectionLabel = 'mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400';

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="text-lg font-extrabold text-brand">{BRAND[locale] || BRAND.en}</Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-700 lg:flex">
          {/* Directory dropdown */}
          <div className="relative" ref={dirRef}>
            <button type="button" onClick={() => setDirOpen((v) => !v)} aria-haspopup="true" aria-expanded={dirOpen}
              className={`flex items-center gap-1 ${dirActive ? 'text-brand' : 'hover:text-brand'}`}>
              {ml ? 'ഡയറക്ടറി' : 'Directory'}
              <span className={`text-[10px] transition-transform ${dirOpen ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
            </button>
            {dirOpen && (
              <div role="menu" className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                {DIRECTORY.map((l) => (
                  <Link key={l.href} href={`/${locale}/${l.href}`} role="menuitem" aria-current={isActive(l.href) ? 'page' : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm ${isActive(l.href) ? 'bg-teal-50 text-brand' : 'text-gray-700 hover:bg-gray-100'}`}>
                    {L(l)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {TOP.map((l) => (
            <Link key={l.href} href={`/${locale}/${l.href}`} aria-current={isActive(l.href) ? 'page' : undefined}
              className={isActive(l.href) ? 'text-brand' : 'hover:text-brand'}>{L(l)}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/emergency`}
            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700">
            🚨 {ml ? 'അടിയന്തരം' : 'Emergency'}
          </Link>
          <Link href={`/${locale}/login`}
            className="hidden rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark sm:inline-block">
            {ml ? 'ലോഗിൻ' : 'Login'}
          </Link>
          <Link href={`/${other}`} aria-label={ml ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറുക'}
            className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:border-brand hover:text-brand">
            {ml ? 'EN' : 'ML'}
          </Link>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}
            className="rounded-lg border border-gray-300 p-2 text-gray-700 lg:hidden">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-brand">{BRAND[locale] || BRAND.en}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center text-gray-500">✕</button>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              <Link href={`/${locale}/emergency`} className={`${drawerLink} bg-red-600 text-white`}>🚨 {ml ? 'അടിയന്തരം' : 'Emergency'}</Link>

              <div className={sectionLabel}>{ml ? 'ഡയറക്ടറി' : 'Directory'}</div>
              {DIRECTORY.map((l) => (
                <Link key={l.href} href={`/${locale}/${l.href}`} aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`${drawerLink} ${isActive(l.href) ? 'bg-teal-50 text-brand' : 'text-gray-700 hover:bg-gray-100'}`}>{L(l)}</Link>
              ))}

              <div className={sectionLabel}>{ml ? 'കൂടുതൽ' : 'More'}</div>
              {[...TOP, ...MORE].map((l) => (
                <Link key={l.href} href={`/${locale}/${l.href}`} aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`${drawerLink} ${isActive(l.href) ? 'bg-teal-50 text-brand' : 'text-gray-700 hover:bg-gray-100'}`}>{L(l)}</Link>
              ))}

              <div className={sectionLabel}>{ml ? 'ആരോഗ്യ കേന്ദ്രങ്ങൾ' : 'Health Centres'}</div>
              {HUBS.map((l) => (
                <Link key={l.href} href={`/${locale}/${l.href}`} className={`${drawerLink} text-gray-700 hover:bg-gray-100`}>{L(l)}</Link>
              ))}

              <Link href={`/${locale}/login`} className={`${drawerLink} mt-3 justify-center bg-brand text-white`}>
                {ml ? 'ലോഗിൻ' : 'Login'}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
