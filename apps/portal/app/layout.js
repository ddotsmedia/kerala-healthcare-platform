// Portal root layout — doctor & hospital self-service. Auth lands in Phase 2.

import './globals.css';

export const metadata = {
  title: 'KHP Portal',
  description: 'Kerala Health Portal — provider portal'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <header className="mb-6 flex items-center justify-between border-b border-gray-200 pb-3">
            <h1 className="text-lg font-bold text-brand">KHP Provider Portal</h1>
            <nav className="flex gap-4 text-sm">
              <a href="/profile" className="hover:text-brand">Doctor</a>
              <a href="/hospital" className="hover:text-brand">Hospital</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
