// Admin root layout. Internal tool — access restricted to verification_agent /
// platform_admin (auth enforced in Phase 2; see BLOCKERS.md).

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
            <span className="text-xs text-gray-500">Verification queue</span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
