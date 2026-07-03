// Locale layout — emergency banner, sticky navbar, footer w/ disclaimer.

import { notFound } from 'next/navigation';
import { LOCALES } from '@/lib/i18n';
import EmergencyBanner from '@/components/home/EmergencyBanner';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import WhatsAppShare from '@/components/whatsapp/WhatsAppShare';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props) {
  const params = await props.params;
  const { children } = props;
  const { locale } = params;
  if (!LOCALES.includes(locale)) notFound();
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <EmergencyBanner locale={locale} />
      <Navbar locale={locale} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <WhatsAppShare locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
