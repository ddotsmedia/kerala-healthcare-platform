// logger — structured JSON logger (app copy; mirrors services/logger).
// Kept in-app to avoid a new workspace package + lockfile churn.

function log(level, message, meta = {}) {
  const rec = {
    level,
    message: String(message),
    timestamp: new Date().toISOString(),
    ...(meta.requestId ? { requestId: meta.requestId } : {}),
    meta
  };
  const line = JSON.stringify(rec);
  if (level === 'error' || level === 'warn') console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (m, meta) => log('debug', m, meta),
  info: (m, meta) => log('info', m, meta),
  warn: (m, meta) => log('warn', m, meta),
  error: (m, meta) => log('error', m, meta)
};

export default logger;
