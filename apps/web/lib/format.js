// format.js — display helpers for dates/times. Pure.

export function fmtDate(d) {
  if (!d) return '';
  return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
}

export function fmtTime(t) {
  return t ? String(t).slice(0, 5) : '';
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
