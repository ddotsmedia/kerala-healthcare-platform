// aiAnalytics.js — P-G7 AI assistant analytics from ai_interaction_log.
// Privacy note: the log stores only an input HASH (no raw query text) plus
// rag_source_ids, flags, response_length. So "top topics" and "consult a doctor"
// text matching are not possible; we use flags + hash recurrence + RAG presence.
// Cached 5 min.

import { getPool } from '@khp/db';
import { cached } from '@khp/cache';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}
const clampDays = (d, def) => Math.max(1, Math.min(365, parseInt(d, 10) || def));

export function getDailyInteractions(days = 14) {
  const d = clampDays(days, 14);
  return cached(`ai:daily:${d}`, 300, async () => rows(
    `SELECT to_char(g.day,'YYYY-MM-DD') AS day, coalesce(c.n,0)::int AS n
       FROM generate_series(current_date - ($1 - 1), current_date, interval '1 day') g(day)
       LEFT JOIN (SELECT created_at::date AS day, count(*) n FROM ai_interaction_log
                   WHERE created_at > now() - make_interval(days => $1) GROUP BY 1) c ON c.day = g.day
      ORDER BY g.day`, [d]));
}

export function getRAGHitRate(days = 7) {
  const d = clampDays(days, 7);
  return cached(`ai:rag:${d}`, 300, async () => {
    const [r] = await rows(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE coalesce(array_length(rag_source_ids,1),0) > 0)::int AS with_rag
         FROM ai_interaction_log WHERE created_at > now() - make_interval(days => $1)`, [d]);
    const total = r ? r.total : 0;
    const withRag = r ? r.with_rag : 0;
    return { total, withRag, rate: total > 0 ? Math.round((withRag / total) * 100) : 0 };
  });
}

/** Flag frequency (e.g. diagnosis_declined = redirected to a professional, emergency). */
export function getFlagBreakdown(days = 7) {
  const d = clampDays(days, 7);
  return cached(`ai:flags:${d}`, 300, async () => rows(
    `SELECT f AS flag, count(*)::int AS n
       FROM ai_interaction_log, unnest(flags) f
      WHERE created_at > now() - make_interval(days => $1)
      GROUP BY f ORDER BY n DESC`, [d]));
}

/**
 * Knowledge gaps: interactions with NO retrieved knowledge-base article
 * (empty rag_source_ids) — a proxy for questions the platform can't yet answer.
 * Returns the count plus recurring anonymised questions (by input hash).
 */
export function getKnowledgeGaps(days = 7) {
  const d = clampDays(days, 7);
  return cached(`ai:gaps:${d}`, 300, async () => {
    const [c] = await rows(
      `SELECT count(*)::int AS no_rag,
              count(*) FILTER (WHERE 'diagnosis_declined' = ANY(flags))::int AS redirected
         FROM ai_interaction_log
        WHERE created_at > now() - make_interval(days => $1)`, [d]);
    const recurring = await rows(
      `SELECT left(input_hash, 10) AS hash, count(*)::int AS asked, max(locale) AS locale
         FROM ai_interaction_log
        WHERE created_at > now() - make_interval(days => $1)
          AND coalesce(array_length(rag_source_ids,1),0) = 0 AND input_hash IS NOT NULL
        GROUP BY input_hash HAVING count(*) > 1 ORDER BY asked DESC LIMIT 15`, [d]);
    return { noRag: c ? c.no_rag : 0, redirected: c ? c.redirected : 0, recurring };
  });
}

/** Most-repeated questions overall (anonymised by input hash). */
export function getTopRecurring(days = 7) {
  const d = clampDays(days, 7);
  return cached(`ai:recur:${d}`, 300, async () => rows(
    `SELECT left(input_hash, 10) AS hash, count(*)::int AS asked,
            count(*) FILTER (WHERE coalesce(array_length(rag_source_ids,1),0) > 0)::int AS answered_with_rag
       FROM ai_interaction_log
      WHERE created_at > now() - make_interval(days => $1) AND input_hash IS NOT NULL
      GROUP BY input_hash HAVING count(*) > 1 ORDER BY asked DESC LIMIT 15`, [d]));
}
