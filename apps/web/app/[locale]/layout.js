// Locale layout — header, non-dismissable disclaimer footer. Validates locale.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, t } from '@/lib/i18n';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  if (!LOCALES.includes(locale)) notFound();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href={`/${locale}`} className="text-lg font-bold text-brand">
            {t(locale, 'site')}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href={`/${locale}/doctors`} className="hover:text-brand">{t(locale, 'doctors')}</Link>
            <Link href={`/${locale}/hospitals`} className="hover:text-brand">{t(locale, 'hospitals')}</Link>
            <Link href={`/${locale}/health`} className="hover:text-brand">{t(locale, 'health')}</Link>
            <Link href={`/${locale}/symptoms`} className="hover:text-brand">{t(locale, 'symptoms')}</Link>
            <Link href={`/${locale}/patient`} className="hover:text-brand">{t(locale, 'my_appointments')}</Link>
            <Link href={`/${locale === 'ml' ? 'en' : 'ml'}`} className="text-gray-500 hover:text-brand">
              {locale === 'ml' ? 'EN' : 'ML'}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <footer className="mt-auto">
        <MedicalDisclaimer locale={locale} />
      </footer>
    </div>
  );
}
