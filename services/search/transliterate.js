// transliterate.js
// Malayalam <-> Latin (Manglish) helpers. Pure functions, no dependencies.
// Used to build the search_manglish vector from Malayalam text and to
// normalise user query input. Approximate, search-oriented — not linguistic.

const MALAYALAM_RANGE = /[ഀ-ൿ]/;

// Malayalam codepoint -> Latin approximation (search-oriented).
const ML_TO_LATIN = {
  // Independent vowels
  'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഊ': 'oo',
  'ഋ': 'ru', 'എ': 'e', 'ഏ': 'e', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'o', 'ഔ': 'au',
  'ഈ': 'ee', 'ഉ': 'u',
  // Consonants
  'ക': 'ka', 'ഖ': 'kha', 'ഗ': 'ga', 'ഘ': 'gha', 'ങ': 'nga',
  'ച': 'cha', 'ഛ': 'chha', 'ജ': 'ja', 'ഝ': 'jha', 'ഞ': 'nja',
  'ട': 'ta', 'ഠ': 'tha', 'ഡ': 'da', 'ഢ': 'dha', 'ണ': 'na',
  'ത': 'tha', 'ഥ': 'thha', 'ദ': 'da', 'ധ': 'dha', 'ന': 'na',
  'പ': 'pa', 'ഫ': 'pha', 'ബ': 'ba', 'ഭ': 'bha', 'മ': 'ma',
  'യ': 'ya', 'ര': 'ra', 'ല': 'la', 'വ': 'va', 'ശ': 'sha',
  'ഷ': 'sha', 'സ': 'sa', 'ഹ': 'ha', 'ള': 'la', 'ഴ': 'zha', 'റ': 'ra',
  // Chillu
  'ൻ': 'n', 'ർ': 'r', 'ൽ': 'l', 'ൾ': 'l', 'ൺ': 'n', 'ൿ': 'k',
  // Dependent vowel signs
  'ാ': 'aa', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo', 'ൃ': 'ru',
  'െ': 'e', 'േ': 'e', 'ൈ': 'ai', 'ൊ': 'o', 'ോ': 'o', 'ൌ': 'au', 'ൗ': 'au',
  // Signs
  'ം': 'm', 'ഃ': 'h', '്': '',
  // Digits
  '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4',
  '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9'
};

/**
 * @param {string} str
 * @returns {boolean} true if the string contains Malayalam script.
 */
function isMalayalam(str) {
  return typeof str === 'string' && MALAYALAM_RANGE.test(str);
}

/**
 * Transliterate Malayalam text to a Latin (Manglish) approximation.
 * Non-Malayalam characters pass through unchanged.
 * @param {string} str
 * @returns {string}
 */
function malayalamToLatin(str) {
  if (!str) return '';
  let out = '';
  for (const ch of str) {
    out += Object.prototype.hasOwnProperty.call(ML_TO_LATIN, ch) ? ML_TO_LATIN[ch] : ch;
  }
  return normalizeLatin(out);
}

/**
 * Lowercase, fold whitespace, strip punctuation — for Latin/Manglish matching.
 * Diacritic folding is handled in PostgreSQL by the unaccent extension.
 * @param {string} str
 * @returns {string}
 */
function normalizeLatin(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export { isMalayalam, malayalamToLatin, normalizeLatin, MALAYALAM_RANGE };
