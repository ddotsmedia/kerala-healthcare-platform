// Site footer — logo, quick links, specialties, districts, connect, disclaimer.
// Server component; specialty/district links use real ids (cached lookups).

import Link from 'next/link';
import { listDistricts, listSpecialties } from '@/lib/providers';

const BRAND = { ml: 'മലയാളി ഡോക്ടർ', en: 'MalayaliDoctor' };
const TAGLINE = {
  ml: 'കേരളത്തിന്റെ ഡിജിറ്റൽ ആരോഗ്യ കൂട്ടാളി',
  en: "Kerala's digital healthcare companion"
};
const DISCLAIMER =
  'ഈ വെബ്സൈറ്റിലെ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രമുള്ളതാണ്. വൈദ്യോപദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക.';

const QUICK = [
  { href: 'about', ml: 'ഞങ്ങളെ കുറിച്ച്', en: 'About' },
  { href: 'how-it-works', ml: 'എങ്ങനെ ഉപയോഗിക്കാം', en: 'How It Works' },
  { href: 'for-doctors', ml: 'ഡോക്ടർമാർക്കായി', en: 'For Doctors' },
  { href: 'for-hospitals', ml: 'ആശുപത്രികൾക്കായി', en: 'For Hospitals' },
  { href: 'contact', ml: 'ബന്ധപ്പെടുക', en: 'Contact' }
];
const SOCIAL = ['📘', '𝕏', '📸', '▶️'];

function Col({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-2 text-sm text-gray-400">{children}</ul>
    </div>
  );
}

export default async function Footer({ locale = 'ml' }) {
  const ml = locale === 'ml';
  const [districts, specialties] = await Promise.all([listDistricts(), listSpecialties()]);
  const nm = (r) => (ml ? r.name_ml : r.name_en) || r.name_en;

  return (
    <footer className="w-full bg-[#1a1a2e] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="text-xl font-extrabold text-teal-400">{BRAND[locale] || BRAND.en}</div>
            <p className="mt-2 text-sm text-gray-400">{TAGLINE[locale] || TAGLINE.en}</p>
          </div>

          <Col title={ml ? 'ദ്രുത ലിങ്കുകൾ' : 'Quick Links'}>
            {QUICK.map((q) => (
              <li key={q.href}>
                <Link href={`/${locale}/${q.href}`} className="hover:text-teal-400">{ml ? q.ml : q.en}</Link>
              </li>
            ))}
          </Col>

          <Col title={ml ? 'സ്പെഷ്യാലിറ്റികൾ' : 'Specialties'}>
            {specialties.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link href={`/${locale}/doctors?specialty=${s.id}`} className="hover:text-teal-400">{nm(s)}</Link>
              </li>
            ))}
          </Col>

          <Col title={ml ? 'ജില്ലകൾ' : 'Districts'}>
            {districts.slice(0, 7).map((d) => (
              <li key={d.id}>
                <Link href={`/${locale}/doctors?district=${d.id}`} className="hover:text-teal-400">{nm(d)}</Link>
              </li>
            ))}
          </Col>

          <Col title={ml ? 'ബന്ധപ്പെടുക' : 'Connect'}>
            <li className="flex gap-3 text-lg">
              {SOCIAL.map((s, i) => (
                <span key={i} aria-hidden="true" className="cursor-pointer opacity-80 hover:opacity-100">{s}</span>
              ))}
            </li>
          </Col>
        </div>

        <div className="mt-10 rounded-lg bg-white/5 px-4 py-3 text-xs leading-relaxed text-gray-400">
          <span className="font-semibold text-gray-300">{ml ? 'നിരാകരണം: ' : 'Disclaimer: '}</span>
          {DISCLAIMER}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row">
          <span>© 2025 MalayaliDoctor.com</span>
          <div className="flex gap-4">
            <Link href={`/${locale}/privacy`} className="hover:text-teal-400">{ml ? 'സ്വകാര്യത' : 'Privacy Policy'}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-teal-400">{ml ? 'നിബന്ധനകൾ' : 'Terms'}</Link>
            <Link href={`/${locale}/disclaimer`} className="hover:text-teal-400">{ml ? 'മെഡിക്കൽ നിരാകരണം' : 'Medical Disclaimer'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
