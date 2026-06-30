// quiet-hours.js — no notifications between 22:00 and 07:00 (local server time).

const QUIET_START = 22; // 10 PM
const QUIET_END = 7;    // 7 AM

/** @param {Date} [now] @returns {boolean} */
function isQuietHours(now = new Date()) {
  const h = now.getHours();
  return h >= QUIET_START || h < QUIET_END;
}

export { isQuietHours, QUIET_START, QUIET_END };
