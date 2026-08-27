// components/LanguageSelector.js - Language selection UI (EN & ML ONLY)

'use client'
import { useContext } from 'react'
import { LanguageContext } from '@/app/lib/i18n-provider'

export function LanguageSelector() {
  const { language, changeLanguage } = useContext(LanguageContext)

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' }
  ]

  return (
    <div className="flex gap-1 bg-white dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded-lg font-medium text-sm transition-all ${
            language === lang.code
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={lang.name}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.flag} {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector
