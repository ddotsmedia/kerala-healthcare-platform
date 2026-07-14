// newsFormat.js — PURE, client-safe helpers for the news feed (labels, dates).

const CATEGORY_LABELS = {
  outbreak: { ml: 'പകർച്ചവ്യാധി', en: 'Outbreak', cls: 'bg-red-100 text-red-700' },
  advisory: { ml: 'ജാഗ്രത', en: 'Advisory', cls: 'bg-amber-100 text-amber-700' },
  policy: { ml: 'നയം', en: 'Policy', cls: 'bg-blue-100 text-blue-700' },
  awareness: { ml: 'അവബോധം', en: 'Awareness', cls: 'bg-green-100 text-green-700' },
  research: { ml: 'ഗവേഷണം', en: 'Research', cls: 'bg-purple-100 text-purple-700' }
};

const CATEGORY_TABS = ['outbreak', 'advisory', 'policy', 'awareness', 'research'];

function categoryLabel(cat, locale = 'ml') {
  const c = CATEGORY_LABELS[cat];
  if (!c) return cat || '';
  return locale === 'ml' ? c.ml : c.en;
}
function categoryClass(cat) { return (CATEGORY_LABELS[cat] || {}).cls || 'bg-gray-100 text-gray-600'; }

/** Relative time from an ISO/date string. Deterministic vs a passed "now" (ms). */
function relativeTime(dateStr, locale = 'ml', nowMs) {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  const s = Math.max(0, Math.floor((now - then) / 1000));
  const ml = locale === 'ml';
  const units = [
    [31536000, ml ? 'വർഷം' : 'y'], [2592000, ml ? 'മാസം' : 'mo'],
    [86400, ml ? 'ദിവസം' : 'd'], [3600, ml ? 'മണിക്കൂർ' : 'h'], [60, ml ? 'മിനിറ്റ്' : 'm']
  ];
  for (const [sec, label] of units) {
    const v = Math.floor(s / sec);
    if (v >= 1) return ml ? `${v} ${label} മുൻപ്` : `${v}${label} ago`;
  }
  return ml ? 'ഇപ്പോൾ' : 'now';
}

export { CATEGORY_LABELS, CATEGORY_TABS, categoryLabel, categoryClass, relativeTime };
