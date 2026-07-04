// Root layout. Malayalam-first: Noto Sans Malayalam, never a system fallback.

import { Noto_Sans_Malayalam } from 'next/font/google';
import './globals.css';

const malayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-malayalam',
  display: 'swap'
});

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://malayalidoctor.com';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'Kerala Health Portal',
  description: 'Find verified doctors and hospitals in Kerala. Malayalam-first.',
  applicationName: 'MalayaliDoctor',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MalayaliDoctor' },
  icons: { apple: '/icons/icon-192.png' },
  openGraph: {
    siteName: 'MalayaliDoctor',
    locale: 'ml_IN',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MalayaliDoctor — Kerala Health Portal' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MalayaliDoctor — Kerala Health Portal',
    description: 'Find verified doctors and hospitals in Kerala.',
    images: ['/og-image.png']
  }
};

export const viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="ml" className={malayalam.variable}>
      <body className="font-malayalam">{children}</body>
    </html>
  );
}
