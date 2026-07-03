// validate.js — dependency-free input validation (no zod).

const PATTERNS = {
  mobile: /^\+?[0-9]{7,15}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slug: /^[a-z0-9-]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}(:\d{2})?$/
};

/**
 * Validate one value against a field spec.
 * @param {*} value
 * @param {{type?:string, required?:boolean, min?:number, max?:number, format?:string, enum?:string[]}} spec
 * @returns {{ ok:boolean, error?:string }}
 */
function validateField(value, spec = {}) {
  const empty = value == null || value === '';
  if (spec.required && empty) return { ok: false, error: 'required' };
  if (empty) return { ok: true };

  if (spec.type === 'number') {
    const n = Number(value);
    if (!Number.isFinite(n)) return { ok: false, error: 'not_a_number' };
    if (spec.min != null && n < spec.min) return { ok: false, error: 'too_small' };
    if (spec.max != null && n > spec.max) return { ok: false, error: 'too_large' };
    return { ok: true };
  }

  const s = String(value);
  if (spec.min != null && s.length < spec.min) return { ok: false, error: 'too_short' };
  if (spec.max != null && s.length > spec.max) return { ok: false, error: 'too_long' };
  if (spec.format && PATTERNS[spec.format] && !PATTERNS[spec.format].test(s)) return { ok: false, error: `invalid_${spec.format}` };
  if (spec.enum && !spec.enum.includes(s)) return { ok: false, error: 'not_allowed' };
  return { ok: true };
}

/**
 * Validate an object against a schema of field specs.
 * @returns {{ ok:boolean, errors:Object }}
 */
function validate(obj, schema) {
  const errors = {};
  for (const [key, spec] of Object.entries(schema)) {
    const r = validateField(obj ? obj[key] : undefined, spec);
    if (!r.ok) errors[key] = r.error;
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export { validate, validateField, PATTERNS };
