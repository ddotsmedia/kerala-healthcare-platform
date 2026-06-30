// time.js — small HH:MM[:SS] <-> minutes helpers. Pure, no dependencies.

/** 'HH:MM' or 'HH:MM:SS' -> minutes since midnight. */
function toMinutes(t) {
  if (!t) return 0;
  const [h, m] = String(t).split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

/** minutes -> 'HH:MM:SS'. */
function toTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/** Day of week 0-6 (Sun=0) for a 'YYYY-MM-DD' date string, UTC-safe. */
function dayOfWeek(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export { toMinutes, toTime, dayOfWeek };
