// Doctor publications & awards for the public profile.

import { getPool } from '@khp/db';

export async function getPublications(providerId) {
  if (!providerId) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT id, title, journal, year, doi, pubmed_id, url, type
         FROM provider_publications
        WHERE provider_id=$1 AND deleted_at IS NULL
        ORDER BY sort_order, year DESC NULLS LAST, created_at DESC`,
      [providerId]
    );
    return rows;
  } catch (err) {
    console.error(`getPublications failed: ${err.message}`);
    return [];
  }
}

export async function getAwards(providerId) {
  if (!providerId) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT id, title, awarded_by, year, description
         FROM provider_awards
        WHERE provider_id=$1 AND deleted_at IS NULL
        ORDER BY sort_order, year DESC NULLS LAST, created_at DESC`,
      [providerId]
    );
    return rows;
  } catch (err) {
    console.error(`getAwards failed: ${err.message}`);
    return [];
  }
}
