// shareCards.js — pre-written share messages per page type (ml + en).
// Pure functions; safe to import in server or client components.

/** Doctor share message. */
export function doctorShareText({ name, specialty, district }, locale = 'ml') {
  const parts = [specialty, district].filter(Boolean).join(', ');
  return locale === 'ml'
    ? `MalayaliDoctor-ൽ ഒരു മികച്ച ഡോക്ടറെ കണ്ടെത്തി: ${name}${parts ? ` — ${parts}` : ''}`
    : `I found a great doctor on MalayaliDoctor: ${name}${parts ? ` — ${parts}` : ''}`;
}

/** Hospital share message. */
export function hospitalShareText({ name, district }, locale = 'ml') {
  return locale === 'ml'
    ? `MalayaliDoctor-ൽ ${name}${district ? `, ${district}` : ''} — വിശദാംശങ്ങൾ കാണൂ`
    : `${name}${district ? `, ${district}` : ''} on MalayaliDoctor — see details`;
}

/** Article share message. */
export function articleShareText({ title }, locale = 'ml') {
  return locale === 'ml'
    ? `ഉപകാരപ്രദമായ ആരോഗ്യ വിവരം: ${title} — MalayaliDoctor.com വഴി`
    : `Useful health info: ${title} via MalayaliDoctor.com`;
}
