const VALIDATORS = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v) => /^\d{10,15}$/.test(v.replace(/\D/g, '')),
  uuid: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  date: (v) => !isNaN(Date.parse(v)),
  positive: (v) => Number(v) > 0,
  alphanumeric: (v) => /^[a-zA-Z0-9_-]*$/.test(v),
  url: (v) => {
    try {
      new URL(v)
      return true
    } catch {
      return false
    }
  }
}

function sanitizeString(v) {
  if (typeof v !== 'string') return ''
  return v
    .trim()
    .slice(0, 1000) // Max 1000 chars
    .replace(/[<>\"']/g, '') // Remove HTML chars
}

function sanitizeJSON(data) {
  if (!data || typeof data !== 'object') return null
  try {
    const str = JSON.stringify(data)
    if (str.length > 5000) return null // Max 5KB
    return JSON.parse(str)
  } catch {
    return null
  }
}

function validateInput(data, schema) {
  const errors = {}

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key]

    if (rules.required && (value === null || value === undefined || value === '')) {
      errors[key] = 'Required field'
      continue
    }

    if (!value) continue

    if (rules.type === 'string') {
      if (typeof value !== 'string') {
        errors[key] = 'Must be string'
        continue
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[key] = `Max ${rules.maxLength} characters`
      }
      if (rules.minLength && value.length < rules.minLength) {
        errors[key] = `Min ${rules.minLength} characters`
      }
    }

    if (rules.type === 'number') {
      if (isNaN(Number(value))) {
        errors[key] = 'Must be number'
        continue
      }
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors[key] = `Must be >= ${rules.min}`
      }
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors[key] = `Must be <= ${rules.max}`
      }
    }

    if (rules.validate && !VALIDATORS[rules.validate](value)) {
      errors[key] = `Invalid ${rules.validate}`
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}

export { validateInput, sanitizeString, sanitizeJSON, VALIDATORS }
