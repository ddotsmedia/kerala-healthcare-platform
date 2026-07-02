// safety.js — hardcoded guardrails. These run in CODE, not just the prompt, so
// the assistant cannot diagnose or omit safety guidance regardless of model output.

const EMERGENCY_NUMBERS = { ml: 'അടിയന്തരം: 112 · ആംബുലൻസ്: 108', en: 'Emergency: 112 · Ambulance: 108' };

const CONSULT = {
  ml: 'എപ്പോഴും യോഗ്യതയുള്ള ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക. ഇത് രോഗനിർണയമോ ചികിത്സാ ഉപദേശമോ അല്ല.',
  en: 'Always consult a qualified healthcare professional. This is not a diagnosis or treatment advice.'
};

const DECLINE = {
  ml: 'ക്ഷമിക്കണം, എനിക്ക് രോഗനിർണയം നടത്താനോ മരുന്ന് നിർദ്ദേശിക്കാനോ കഴിയില്ല. ദയവായി ഒരു ഡോക്ടറെ സമീപിക്കുക.',
  en: 'Sorry, I cannot diagnose conditions or recommend medication. Please consult a doctor.'
};

const EMERGENCY_WORDS = /(emergency|അത്യാഹിതം|അടിയന്തര|heart attack|stroke|bleeding|unconscious|ശ്വാസം മുട്ട്|നെഞ്ചുവേദന|chest pain|suicide|ആത്മഹത്യ)/i;
const DIAGNOSIS_WORDS = /(diagnose|diagnosis|what do i have|what disease|രോഗനിർണയം|എനിക്ക് എന്ത് രോഗം|prescribe|which medicine|dosage|മരുന്ന് നിർദ്ദേശി)/i;

/** Strip prompt-injection attempts before the text reaches any prompt. */
function sanitiseInput(text) {
  if (!text) return '';
  return String(text)
    .replace(/ignore (all |previous |above )?(instructions|prompts?)/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/assistant\s*:/gi, '')
    .replace(/you are now/gi, '')
    .replace(/disregard/gi, '')
    .replace(/<\/?[^>]+>/g, '')
    .trim()
    .slice(0, 2000);
}

function isEmergency(text) { return EMERGENCY_WORDS.test(text || ''); }
function isDiagnosisRequest(text) { return DIAGNOSIS_WORDS.test(text || ''); }

/**
 * Enforce safety on a (possibly model-generated) response.
 * @returns {{ text:string, flags:string[] }}
 */
function enforceSafety(response, userMessage, locale) {
  const l = locale === 'en' ? 'en' : 'ml';
  const flags = [];
  let text = response || '';

  if (isDiagnosisRequest(userMessage)) {
    flags.push('diagnosis_declined');
    text = `${DECLINE[l]}`;
  }
  if (isEmergency(userMessage)) {
    flags.push('emergency');
    text = `${EMERGENCY_NUMBERS[l]}\n\n${text}`;
  }
  // Always append the consult-a-professional line if not already present.
  if (!text.includes('112') && !new RegExp('108').test(text)) {
    // non-emergency: keep as-is
  }
  text = `${text}\n\n${CONSULT[l]}`;
  return { text: text.trim(), flags };
}

export { sanitiseInput, isEmergency, isDiagnosisRequest, enforceSafety, EMERGENCY_NUMBERS, CONSULT };
