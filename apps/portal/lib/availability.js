// availability.js — manage a provider's weekly templates and date overrides.
// Parameterised SQL only. provider = the logged-in doctor.

import { getPool } from '@khp/db';

async function listTemplates(providerId) {
  if (!providerId) return [];
  const { rows } = await getPool().query(
    `SELECT id, day_of_week, start_time, end_time, slot_duration_minutes, consultation_mode, is_active
       FROM availability_templates
      WHERE provider_id = $1 AND deleted_at IS NULL
      ORDER BY day_of_week, start_time`,
    [providerId]
  );
  return rows;
}

async function addTemplate(providerId, tpl) {
  if (!providerId) throw new Error('No provider');
  await getPool().query(
    `INSERT INTO availability_templates
       (provider_id, day_of_week, start_time, end_time, slot_duration_minutes, consultation_mode)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [providerId, tpl.day_of_week, tpl.start_time, tpl.end_time, tpl.slot_duration_minutes || 30, tpl.consultation_mode || 'in_person']
  );
}

async function removeTemplate(providerId, id) {
  await getPool().query(
    `UPDATE availability_templates SET deleted_at = now(), updated_at = now()
      WHERE id = $1 AND provider_id = $2 AND deleted_at IS NULL`,
    [id, providerId]
  );
}

async function listOverrides(providerId) {
  if (!providerId) return [];
  const { rows } = await getPool().query(
    `SELECT id, override_date, is_blocked, start_time, end_time, reason
       FROM availability_overrides
      WHERE provider_id = $1 AND deleted_at IS NULL AND override_date >= current_date
      ORDER BY override_date`,
    [providerId]
  );
  return rows;
}

async function addOverride(providerId, o) {
  if (!providerId) throw new Error('No provider');
  await getPool().query(
    `INSERT INTO availability_overrides
       (provider_id, override_date, is_blocked, start_time, end_time, reason)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [providerId, o.override_date, !!o.is_blocked, o.start_time || null, o.end_time || null, o.reason || null]
  );
}

async function removeOverride(providerId, id) {
  await getPool().query(
    `UPDATE availability_overrides SET deleted_at = now(), updated_at = now()
      WHERE id = $1 AND provider_id = $2 AND deleted_at IS NULL`,
    [id, providerId]
  );
}

export { listTemplates, addTemplate, removeTemplate, listOverrides, addOverride, removeOverride };
