// Global 404.

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="#0d9488" opacity="0.1" />
        <text x="60" y="74" font-family="Arial,sans-serif" font-size="44" font-weight="800" fill="#0d9488" text-anchor="middle">404</text>
      </svg>
      <h1 className="text-xl font-bold text-gray-900">പേജ് കണ്ടെത്തിയില്ല</h1>
      <p className="text-sm text-gray-600">Page not found. Try one of these:</p>
      <form action="/ml/search" method="get" className="flex w-full gap-2">
        <input name="q" placeholder="ഡോക്ടർ, സ്പെഷ്യാലിറ്റി…" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">തിരയുക</button>
      </form>
      <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold text-brand">
        <Link href="/ml" className="hover:underline">ഹോം</Link>
        <Link href="/ml/doctors" className="hover:underline">ഡോക്ടർമാർ</Link>
        <Link href="/ml/emergency" className="text-red-600 hover:underline">അടിയന്തരം</Link>
      </div>
    </div>
  );
}
