// services/search — directory search query builders (Malayalam + Manglish).
// Pure query builders; execution is the caller's responsibility (pass to the db pool).

export { isMalayalam, malayalamToLatin, normalizeLatin } from './transliterate.js';
export { MEDICAL_TERMS, expandManglish, lookupTerm } from './manglish.js';
export { doctorVectorUpdate, hospitalVectorUpdate, buildVectorUpdate } from './vectors.js';
export { buildDoctorSearch, buildHospitalSearch, resolveTerm, paginate } from './queryBuilder.js';
