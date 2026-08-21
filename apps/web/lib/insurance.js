// insurance.js — insurance panel info for doctor/hospital profiles + the search
// filter dropdown. Read-only. Fails soft (returns empty) so pages still render.

import { getPool } from '@khp/db';
import { cached, TTL } from '@khp/cache';

async function rows(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`insurance query failed: ${err.message}`); return []; }
}

const PMJAY = /pmjay|ayushman/i;

/** Insurance panels for one entity, PMJAY sorted first, then preferred. */
export async function getInsurancePanels(entityType, entityId) {
  if (!entityId) return { panels: [], isPmjay: false };
  const panels = await rows(
    `SELECT insurer_name, policy_types, network_type, max_cashless_limit_inr, is_verified, notes
       FROM insurance_panels
      WHERE entity_type=$1 AND entity_id=$2 AND deleted_at IS NULL AND network_type <> 'not_in_network'
      ORDER BY (network_type='preferred') DESC, insurer_name`,
    [entityType, entityId]
  );
  const isPmjay = panels.some((p) => PMJAY.test(p.insurer_name));
  return { panels, isPmjay };
}

/** Distinct insurer names across all panels, for the search filter dropdown. */
export function listInsurers() {
  return cached('insurance:insurers', TTL.providers, async () => {
    const r = await rows(
      `SELECT DISTINCT insurer_name FROM insurance_panels WHERE deleted_at IS NULL ORDER BY insurer_name`
    );
    return r.map((x) => x.insurer_name);
  });
}
