// Admin root layout. Internal tool — access restricted to verification_agent /
// platform_admin (auth enforced in Phase 2; see BLOCKERS.md).

import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'KHP Admin',
  description: 'Kerala Health Portal — internal admin'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <header className="mb-6 flex items-center justify-between border-b border-gray-300 pb-3">
            <h1 className="text-lg font-bold text-brand">KHP Admin</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/verification" className="hover:text-brand">Verification</Link>
              <Link href="/reviews" className="hover:text-brand">Reviews</Link>
              <Link href="/second-opinion" className="hover:text-brand">2nd Opinion</Link>
              <Link href="/qa" className="hover:text-brand">Q&amp;A</Link>
              <Link href="/forum" className="hover:text-brand">Forum</Link>
              <Link href="/news" className="hover:text-brand">News</Link>
              <Link href="/cms" className="hover:text-brand">CMS</Link>
              <Link href="/analytics" className="hover:text-brand">Analytics</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
