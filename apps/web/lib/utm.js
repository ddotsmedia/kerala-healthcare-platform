// utm.js — preserve paid-campaign attribution across the click path.
// Pure helpers usable in server components; the client capture lives in
// components/landing/UtmCapture.js.

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

/** Pick known UTM/gclid params from a searchParams-like object. */
export function pickUtm(sp = {}) {
  const out = {};
  for (const k of UTM_KEYS) {
    const v = sp[k];
    if (v != null && v !== '') out[k] = String(v).slice(0, 120);
  }
  return out;
}

/** Build a query string ("?a=b&c=d" or "") from a UTM object. */
export function utmQuery(utm = {}) {
  const p = new URLSearchParams();
  for (const k of UTM_KEYS) if (utm[k]) p.set(k, utm[k]);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Append UTM params to a path, merging with any existing query string. */
export function withUtm(path, utm = {}) {
  const q = utmQuery(utm);
  if (!q) return path;
  return path.includes('?') ? `${path}&${q.slice(1)}` : `${path}${q}`;
}
