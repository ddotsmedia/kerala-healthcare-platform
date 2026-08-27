// app/api/middleware/language-validation.js - Language validation (EN & ML ONLY)

export const validateLanguage = (lang) => {
  const VALID_LANGUAGES = ['en', 'ml']
  if (!lang || !VALID_LANGUAGES.includes(lang)) {
    return 'en'
  }
  return lang
}

export const languageMiddleware = (req) => {
  let lang = req.query?.lang ||
             req.headers?.['accept-language']?.split(',')[0]?.split('-')[0] ||
             req.cookies?.language ||
             'en'
  lang = validateLanguage(lang)
  return lang
}

export const isValidLanguageCode = (lang) => {
  return ['en', 'ml'].includes(lang)
}

export const rejectInvalidLanguage = (lang) => {
  if (!isValidLanguageCode(lang)) {
    throw new Error(`Invalid language: ${lang}. Supported languages: en, ml`)
  }
  return lang
}
