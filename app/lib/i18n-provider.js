// app/lib/i18n-provider.js - Language context provider (EN & ML ONLY)

'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [translations, setTranslations] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en'
    const validLang = ['en', 'ml'].includes(savedLang) ? savedLang : 'en'
    setLanguage(validLang)
    loadTranslations(validLang)
  }, [])

  const loadTranslations = async (lang) => {
    try {
      setLoading(true)
      if (!['en', 'ml'].includes(lang)) {
        console.warn(`Invalid language: ${lang}. Using English.`)
        lang = 'en'
      }

      const response = await fetch(`/api/translations?lang=${lang}`)
      const data = await response.json()
      setTranslations(data.translations || {})
      setLanguage(lang)
    } catch (error) {
      console.error('Error loading translations:', error)
      setLanguage('en')
    } finally {
      setLoading(false)
    }
  }

  const changeLanguage = (lang) => {
    if (!['en', 'ml'].includes(lang)) {
      console.error(`Unsupported language: ${lang}. Use 'en' or 'ml'.`)
      lang = 'en'
    }
    localStorage.setItem('language', lang)
    loadTranslations(lang)
  }

  const t = (key, defaultValue = key) => {
    return translations[key] || defaultValue
  }

  return (
    <LanguageContext.Provider value={{
      language,
      translations,
      changeLanguage,
      loading,
      t,
      supportedLanguages: ['en', 'ml']
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider')
  }
  return {
    language: context.language,
    t: context.t,
    changeLanguage: context.changeLanguage,
    supportedLanguages: ['en', 'ml']
  }
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  return context?.language || 'en'
}
