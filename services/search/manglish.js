// manglish.js — top medical-term Manglish (Roman) -> Malayalam dictionary.
// Higher priority than the char-level transliterate.js: a query is first checked
// against these whole-word medical terms; only unmatched input falls back to
// character transliteration. Pure data + functions, no dependencies.

// ~50 common medical / directory terms. Keys are normalised Manglish (lowercase,
// no spaces). Values are the Malayalam form used to query the search_ml vector.
const MEDICAL_TERMS = {
  // People / places
  doctor: 'ഡോക്ടർ', vaidyan: 'വൈദ്യൻ', daktar: 'ഡോക്ടർ',
  aashupatri: 'ആശുപത്രി', aaspathri: 'ആശുപത്രി', aspathri: 'ആശുപത്രി',
  clinic: 'ക്ലിനിക്ക്', kaliveedu: 'ക്ലിനിക്ക്', nurse: 'നഴ്സ്',
  ayurvedam: 'ആയുർവേദം', ayurveda: 'ആയുർവേദം',
  garbhini: 'ഗർഭിണി', pregnancy: 'ഗർഭിണി',
  kuttikal: 'കുട്ടികൾ', children: 'കുട്ടികൾ',
  // Specialties
  hridrogam: 'ഹൃദ്രോഗം', hrudrogam: 'ഹൃദ്രോഗം', cardiology: 'ഹൃദ്രോഗ',
  shishurogam: 'ശിശുരോഗം', pediatrics: 'ശിശുരോഗ',
  twakrogam: 'ത്വക്രോഗം', dermatology: 'ത്വക്രോഗ',
  asthirogam: 'അസ്ഥിരോഗം', orthopedics: 'അസ്ഥിരോഗ',
  manorogam: 'മനോരോഗം', psychiatry: 'മനോരോഗ',
  nethrarogam: 'നേത്രരോഗം', ophthalmology: 'നേത്രരോഗ',
  dantharogam: 'ദന്തരോഗം', dentistry: 'ദന്തരോഗ',
  // Body parts
  hrudayam: 'ഹൃദയം', thala: 'തല', kannu: 'കണ്ണ്', kaathu: 'കാത്',
  pallu: 'പല്ല്', vayar: 'വയറ്', kaal: 'കാല്', kai: 'കൈ',
  thwakk: 'ത്വക്ക്', raktham: 'രക്തം', asthi: 'അസ്ഥി',
  // Symptoms / conditions
  pani: 'പനി', chuma: 'ചുമ', thalavedana: 'തലവേദന', vedana: 'വേദന',
  ksheenam: 'ക്ഷീണം', chumaykk: 'ചുമ', allergy: 'അലർജി',
  pressure: 'രക്തസമ്മർദ്ദം', bp: 'രക്തസമ്മർദ്ദം',
  pramehom: 'പ്രമേഹം', diabetes: 'പ്രമേഹം', sugar: 'പ്രമേഹം',
  // Services / facilities
  scan: 'സ്കാൻ', xray: 'എക്സ്റേ', lab: 'ലാബ്', rakthaparishodhana: 'രക്തപരിശോധന',
  ambulance: 'ആംബുലൻസ്', emergency: 'അത്യാഹിതം', operation: 'ഓപ്പറേഷൻ',
  surgery: 'ശസ്ത്രക്രിയ', medicine: 'മരുന്ന്', marunnu: 'മരുന്ന്',
  chikitsa: 'ചികിത്സ', treatment: 'ചികിത്സ'
};

// Word-final Malayalam modifiers that the 'simple' tsvector config treats as
// part of the token. Stripping trailing anusvara (ം) / visarga (ഃ) lets
// dictionary forms (e.g. ഹൃദ്രോഗം) match the stem that compound seeded text
// actually tokenizes to (ഹൃദ്രോഗ in "ഹൃദ്രോഗ വിദഗ്ധൻ"). Virama (്) is NOT
// stripped — it is part of valid word-final tokens like ക്ലിനിക്ക്.
// Keep the tsvector config 'simple'/exact-token for now; full Malayalam
// stemming is a larger change (see BLOCKERS.md).
const TRAILING_SIGNS = /[ംഃ]+$/;

/**
 * Normalise a Malayalam dictionary term to its searchable stem by removing
 * trailing anusvara/visarga/virama. Idempotent.
 * @param {string} term
 * @returns {string}
 */
function normalizeMalayalamTerm(term) {
  return (term || '').replace(TRAILING_SIGNS, '');
}

/**
 * Expand a Manglish query into Malayalam (normalised stems) using the
 * medical-term dictionary. Unknown tokens are dropped from the expansion (the
 * caller falls back to transliteration for those).
 * @param {string} text
 * @returns {{ malayalam: string, hasMatch: boolean, matched: string[] }}
 */
function expandManglish(text) {
  if (!text) return { malayalam: '', hasMatch: false, matched: [] };
  const tokens = String(text).toLowerCase().split(/\s+/).filter(Boolean);
  const matched = [];
  for (const tok of tokens) {
    const key = tok.replace(/[^a-z0-9ഀ-ൿ]/g, '');
    if (MEDICAL_TERMS[key]) matched.push(normalizeMalayalamTerm(MEDICAL_TERMS[key]));
  }
  return { malayalam: matched.join(' '), hasMatch: matched.length > 0, matched };
}

/**
 * @param {string} token single Manglish word
 * @returns {string|null} Malayalam term or null if unknown.
 */
function lookupTerm(token) {
  if (!token) return null;
  const key = String(token).toLowerCase().replace(/[^a-z0-9ഀ-ൿ]/g, '');
  return MEDICAL_TERMS[key] || null;
}

export { MEDICAL_TERMS, expandManglish, lookupTerm, normalizeMalayalamTerm };
