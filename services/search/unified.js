// unified.js — merge + rank heterogeneous search results. Pure functions.
// Verified providers are boosted; locale-matched content is boosted.

const TYPE_BASE = { doctor: 1.0, hospital: 1.0, article: 0.8, disease: 0.9, procedure: 0.7, job: 0.8 };

/**
 * @param {Array<{type,id,title,url,verified?,localeMatch?,rank?}>} items
 * @param {number} limit
 * @returns {Array} top-ranked, de-duplicated results
 */
function rankResults(items, limit = 10) {
  const seen = new Set();
  const scored = [];
  for (const it of items) {
    if (!it || !it.url || seen.has(it.url)) continue;
    seen.add(it.url);
    let score = TYPE_BASE[it.type] ?? 0.5;
    if (it.verified && (it.type === 'doctor' || it.type === 'hospital')) score *= 1.5;
    if (it.localeMatch) score += 0.3;
    if (it.rank) score += Math.min(0.5, Number(it.rank));
    scored.push({ ...it, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export { rankResults };
