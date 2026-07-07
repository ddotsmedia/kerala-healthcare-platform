// @khp/ai-assistant — health information assistant.
// System prompt is HARDCODED and never user-overridable. Safety is enforced in
// code (safety.js) on top of the prompt. Model: claude-haiku (Universal Prompt Law).

import { findRelevantContent } from './rag.js';
import { logInteraction, recentInteractions } from './logger.js';
import { sanitiseInput, enforceSafety } from './safety.js';

const MODEL = 'claude-haiku-20241022';

const SYSTEM_PROMPT =
  "You are Kerala Healthcare Platform's health information assistant. " +
  'You explain health topics in simple language. ' +
  'You NEVER diagnose medical conditions. ' +
  'You NEVER recommend specific treatments or medications. ' +
  'You ALWAYS recommend consulting a qualified healthcare professional. ' +
  "You respond in the same language as the user's message. " +
  'If asked about an emergency, provide emergency contact numbers first. ' +
  'Kerala emergency: 112 | Ambulance: 108';

const DISCLAIMER = {
  ml: 'ഇത് ആരോഗ്യ വിവരമാണ്, വൈദ്യ ഉപദേശമല്ല.',
  en: 'This is health information, not medical advice.'
};

/** Assemble the final user-turn prompt with RAG context. */
function buildPrompt(userMessage, ragContext, locale) {
  const ctx = ragContext.length
    ? 'Knowledge base context:\n' + ragContext.map((r, i) => `[${i + 1}] ${r.title}: ${r.excerpt}`).join('\n')
    : 'No specific knowledge base article matched.';
  return `${ctx}\n\nUser (${locale}): ${userMessage}\n\nAnswer using the context above where relevant.`;
}

async function callModel(systemPrompt, userPrompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null; // caller falls back to a RAG-only safe answer
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 512, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    });
    if (!res.ok) return null;
    const j = await res.json();
    return (j.content && j.content[0] && j.content[0].text) || null;
  } catch (err) {
    console.error(`ai model call failed: ${err.message}`);
    return null;
  }
}

function fallbackAnswer(ragContext, locale) {
  if (!ragContext.length) {
    return locale === 'ml'
      ? 'ഈ വിഷയത്തെക്കുറിച്ച് പൊതുവായ വിവരങ്ങൾക്ക് ഒരു ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക.'
      : 'For general information on this topic, please consult a health professional.';
  }
  const lead = locale === 'ml' ? 'ഞങ്ങളുടെ വിജ്ഞാനകോശം അനുസരിച്ച്:' : 'Based on our knowledge base:';
  return `${lead}\n` + ragContext.slice(0, 3).map((r) => `• ${r.title}: ${r.excerpt}`).join('\n');
}

/**
 * Answer a user health question — RAG + model + hardcoded safety.
 * @returns {Promise<{response:string, sources:Array, disclaimer:string, flags:string[]}>}
 */
async function ask(message, locale = 'ml', sessionId = null) {
  const l = locale === 'en' ? 'en' : 'ml';
  const clean = sanitiseInput(message);
  const sources = await findRelevantContent(clean, 5);
  const userPrompt = buildPrompt(clean, sources, l);
  const modelText = await callModel(SYSTEM_PROMPT, userPrompt);
  const base = modelText || fallbackAnswer(sources, l);
  const { text, flags } = enforceSafety(base, clean, l);

  await logInteraction({
    sessionId, input: clean, responseLength: text.length, model: modelText ? MODEL : 'fallback',
    ragSourceIds: sources.map((s) => s.id), locale: l, flags
  });

  return { response: text, sources: sources.map((s) => ({ title: s.title, url: s.url, type: s.type })), disclaimer: DISCLAIMER[l], flags };
}

const RESUME_SYSTEM_PROMPT =
  'You are a professional CV writer for healthcare workers in Kerala, India. ' +
  'Write a concise, confident professional summary (3-4 sentences) for a resume. ' +
  'Use only the facts provided; never invent qualifications, registrations, or clinical claims. ' +
  'Do not include medical advice. Plain prose only — no headings, no bullet points, no preamble. ' +
  'Write in the requested language.';

/** Compact factual context block from resume fields. */
function resumeContext(r) {
  const p = r.personal || {};
  const exp = (r.experience || []).slice(0, 4).map((e) => `${e.title || ''} @ ${e.org || ''}`.trim()).filter((s) => s !== '@');
  const edu = (r.education || []).slice(0, 3).map((e) => `${e.degree || ''} ${e.institution || ''}`.trim()).filter(Boolean);
  return [
    p.name ? `Name: ${p.name}` : '',
    p.objective ? `Objective: ${p.objective}` : '',
    exp.length ? `Experience: ${exp.join('; ')}` : '',
    edu.length ? `Education: ${edu.join('; ')}` : '',
    (r.skills || []).length ? `Skills: ${(r.skills || []).slice(0, 12).join(', ')}` : ''
  ].filter(Boolean).join('\n');
}

/**
 * AI-enhance a resume professional summary. Haiku only; hardcoded prompt.
 * @param {object} resume resume_profiles row (personal/experience/education/skills)
 * @param {'ml'|'en'} locale
 * @returns {Promise<string|null>} enhanced summary, or null if model unavailable
 */
async function enhanceResumeSummary(resume, locale = 'ml') {
  const l = locale === 'en' ? 'en' : 'ml';
  const ctx = sanitiseInput(resumeContext(resume || {}));
  if (!ctx) return null;
  const lang = l === 'ml' ? 'Malayalam' : 'English';
  const text = await callModel(RESUME_SYSTEM_PROMPT, `Candidate facts:\n${ctx}\n\nWrite the professional summary in ${lang}.`);
  return text ? text.trim() : null;
}

export { ask, buildPrompt, SYSTEM_PROMPT, MODEL, DISCLAIMER, enhanceResumeSummary };
export { recentInteractions, interactionCount, logInteraction } from './logger.js';
export { sanitiseInput } from './safety.js';
export { findRelevantContent } from './rag.js';
