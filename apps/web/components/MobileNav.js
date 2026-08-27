'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const p = usePathname()
  const tabs = [
    { i: '🔍', l: 'Search', h: '/' },
    { i: '📅', l: 'Appointments', h: '/appointments' },
    { i: '❤️', l: 'Health', h: '/health' },
    { i: '💬', l: 'Chat', h: '/chat' },
    { i: '👤', l: 'Profile', h: '/profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 md:hidden border-t border-gray-200 dark:border-gray-800 z-40">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map(t => (
          <Link
            key={t.h}
            href={t.h}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
              p === t.h
                ? 'text-blue-500 border-t-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-2xl">{t.i}</span>
            <span className="text-xs mt-1 font-medium">{t.l}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
