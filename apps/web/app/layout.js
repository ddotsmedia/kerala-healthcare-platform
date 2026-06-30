// Root layout. Malayalam-first: Noto Sans Malayalam, never a system fallback.

import { Noto_Sans_Malayalam } from 'next/font/google';
import './globals.css';

const malayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-malayalam',
  display: 'swap'
});

export const metadata = {
  title: 'Kerala Health Portal',
  description: 'Find verified doctors and hospitals in Kerala. Malayalam-first.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ml" className={malayalam.variable}>
      <body className="font-malayalam">{children}</body>
    </html>
  );
}
