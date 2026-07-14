// qaSafety.js — medical-safety checks for Q&A content (pure; shared server+client).
// Questions asking for a personal diagnosis are blocked and redirected to a
// consultation. Answers must not read as a diagnosis/prescription.

const DIAGNOSIS_PATTERNS = [
  /\bdiagnos(e|is|ing)\b/i,
  /\bdo i have\b/i,
  /\bis (this|it) (cancer|covid|tumou?r|serious)\b/i,
  /\bwhat (do i have|is wrong with me|disease)\b/i,
  /\bam i (dying|pregnant)\b/i,
  /\bwhich (medicine|tablet|drug) should i (take|buy)\b/i,
  /\bwhat (medicine|dose|dosage) (for|should)\b/i
];

/** @returns {boolean} true if the text reads as a request for a personal diagnosis/prescription. */
function looksLikeDiagnosisRequest(text) {
  const s = String(text || '');
  return DIAGNOSIS_PATTERNS.some((re) => re.test(s));
}

const REDIRECT_MSG = {
  ml: 'വ്യക്തിഗത രോഗനിർണയത്തിനോ മരുന്ന് നിർദേശത്തിനോ ഈ ഫോറം ഉപയോഗിക്കാനാവില്ല. കൃത്യമായ രോഗനിർണയത്തിന് ഒരു ഡോക്ടറെ നേരിട്ട് സമീപിക്കുക. പൊതുവായ ആരോഗ്യ വിവരങ്ങൾക്കായി ചോദ്യം മാറ്റിയെഴുതുക.',
  en: 'This forum can’t be used to request a personal diagnosis or prescription. Please consult a doctor directly for a diagnosis. Rephrase your question to ask for general health information.'
};

export { looksLikeDiagnosisRequest, DIAGNOSIS_PATTERNS, REDIRECT_MSG };
