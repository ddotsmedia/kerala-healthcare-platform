// smartSearch.js — run provider/content/job searches in parallel and merge.

import { rankResults } from '@khp/search';
import { findRelevantContent } from '@khp/ai-assistant';
import { searchDoctors, searchHospitals } from './providers.js';
import { searchJobs } from './jobs.js';

/**
 * @param {string} query
 * @param {string} locale
 * @param {string} [typeFilter] optional: doctor|hospital|article|disease|procedure|job
 * @returns {Promise<Array>}
 */
async function smartSearch(query, locale = 'ml', typeFilter) {
  if (!query || !query.trim()) return [];
  const [doctors, hospitals, content, jobs] = await Promise.all([
    searchDoctors({ term: query, limit: 8 }),
    searchHospitals({ term: query, limit: 8 }),
    findRelevantContent(query, 8),
    searchJobs({ term: query, limit: 8 })
  ]);

  const items = [
    ...doctors.map((d) => ({ type: 'doctor', id: d.id, title: d.display_name, url: `/${locale}/doctors/${d.slug}`, verified: true })),
    ...hospitals.map((h) => ({ type: 'hospital', id: h.id, title: locale === 'ml' ? h.name_ml : h.name_en, url: `/${locale}/hospitals/${h.slug}`, verified: true })),
    ...content.map((c) => ({ type: c.type, id: c.id, title: c.title, url: `/${locale}/health/${c.slug}` })),
    ...jobs.map((j) => ({ type: 'job', id: j.id, title: j.title, url: `/${locale}/jobs/${j.slug}` }))
  ];

  const filtered = typeFilter ? items.filter((i) => i.type === typeFilter) : items;
  return rankResults(filtered, 10);
}

export { smartSearch };
