// app/lib/i18n.js - Language configuration (EN & ML ONLY)

export const SUPPORTED_LANGUAGES = {
  'en': {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    nativeName: 'English'
  },
  'ml': {
    code: 'ml',
    name: 'Malayalam',
    flag: '🇮🇳',
    nativeName: 'മലയാളം'
  }
}

export const DEFAULT_LANGUAGE = 'en'

export const getAvailableLanguages = () => {
  return Object.values(SUPPORTED_LANGUAGES)
}

export const isValidLanguage = (lang) => {
  return lang in SUPPORTED_LANGUAGES
}

export const getLanguageName = (code) => {
  return SUPPORTED_LANGUAGES[code]?.name || 'English'
}

export const resolveLocale = (locale) => {
  const valid = ['en', 'ml']
  if (!locale || !valid.includes(locale)) return 'en'
  return locale
}
