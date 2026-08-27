import { sql } from '@khp/db'

const ERROR_CODES = {
  INVALID_INPUT: { code: 400, message: 'Invalid input' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
  FORBIDDEN: { code: 403, message: 'Forbidden' },
  NOT_FOUND: { code: 404, message: 'Not found' },
  CONFLICT: { code: 409, message: 'Conflict' },
  RATE_LIMIT: { code: 429, message: 'Too many requests' },
  INTERNAL_ERROR: { code: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { code: 503, message: 'Service unavailable' }
}

async function logError(error, context = {}) {
  const timestamp = new Date().toISOString()
  const errorLog = {
    timestamp,
    message: error.message || String(error),
    stack: error.stack || '',
    context,
    url: context.url || '',
    method: context.method || '',
    userId: context.userId || null
  }

  console.error('[ERROR]', errorLog)

  try {
    await sql`
      INSERT INTO error_logs (
        timestamp,
        error_message,
        error_stack,
        url,
        method,
        user_id,
        context,
        severity
      ) VALUES (
        ${timestamp},
        ${errorLog.message},
        ${errorLog.stack},
        ${context.url},
        ${context.method},
        ${context.userId},
        ${JSON.stringify(context)},
        'error'
      )
      ON CONFLICT DO NOTHING
    `
  } catch (dbError) {
    console.error('Failed to log error to DB:', dbError)
  }

  return errorLog
}

function handleError(error, context = {}) {
  logError(error, context)

  const statusCode = error.statusCode || 500
  const message = error.message || ERROR_CODES.INTERNAL_ERROR.message

  return {
    statusCode,
    body: {
      error: message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  }
}

function createHTTPError(code, message = null) {
  const errorDef = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR
  const error = new Error(message || errorDef.message)
  error.statusCode = errorDef.code
  error.code = code
  return error
}

export {
  logError,
  handleError,
  createHTTPError,
  ERROR_CODES
}
