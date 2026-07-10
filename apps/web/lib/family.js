// family.js — family members under a primary account. Owner-scoped. Fails soft.

import { getPool } from '@khp/db';

const RELATIONSHIPS = ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other'];
const COLS = `id, name_ml, name_en, relationship, date_of_birth, gender, blood_group, is_minor, created_at`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`family query failed: ${err.message}`); return []; }
}

function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const mm = now.getMonth() - d.getMonth();
  if (mm < 0 || (mm === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

async function listFamily(userId) {
  if (!userId) return [];
  const rows = await run(`SELECT ${COLS} FROM family_members
                            WHERE primary_user_id = $1 AND deleted_at IS NULL
                            ORDER BY created_at ASC`, [userId]);
  return rows.map((r) => ({ ...r, age: ageFromDob(r.date_of_birth) }));
}

async function getFamilyMember(userId, id) {
  if (!userId || !id) return null;
  const rows = await run(`SELECT ${COLS} FROM family_members
                            WHERE id = $1 AND primary_user_id = $2 AND deleted_at IS NULL`, [id, userId]);
  const m = rows[0];
  return m ? { ...m, age: ageFromDob(m.date_of_birth) } : null;
}

/** Confirm a family member belongs to the user (for record ownership checks). */
async function ownsFamilyMember(userId, id) {
  if (!id) return true; // null = self, always allowed
  const rows = await run(`SELECT 1 FROM family_members WHERE id = $1 AND primary_user_id = $2 AND deleted_at IS NULL`, [id, userId]);
  return rows.length > 0;
}

async function addFamilyMember(userId, b) {
  if (!userId || !b.name_en) return null;
  const rel = RELATIONSHIPS.includes(b.relationship) ? b.relationship : 'other';
  const age = ageFromDob(b.date_of_birth);
  const isMinor = age != null ? age < 18 : !!b.is_minor;
  const rows = await run(
    `INSERT INTO family_members (primary_user_id, name_ml, name_en, relationship, date_of_birth, gender, blood_group, is_minor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING ${COLS}`,
    [userId, b.name_ml || null, String(b.name_en).slice(0, 120), rel, b.date_of_birth || null,
     b.gender || null, b.blood_group || null, isMinor]);
  return rows[0] || null;
}

async function updateFamilyMember(userId, id, b) {
  if (!userId) return null;
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val) => { values.push(val); sets.push(`${col} = $${values.length}`); };
  if (b.name_en) push('name_en', String(b.name_en).slice(0, 120));
  if (b.name_ml !== undefined) push('name_ml', b.name_ml || null);
  if (b.relationship && RELATIONSHIPS.includes(b.relationship)) push('relationship', b.relationship);
  if (b.date_of_birth !== undefined) { push('date_of_birth', b.date_of_birth || null); const a = ageFromDob(b.date_of_birth); if (a != null) push('is_minor', a < 18); }
  if (b.gender !== undefined) push('gender', b.gender || null);
  if (b.blood_group !== undefined) push('blood_group', b.blood_group || null);
  if (sets.length === 1) return false;
  values.push(id); values.push(userId);
  const rows = await run(`UPDATE family_members SET ${sets.join(', ')}
                            WHERE id = $${values.length - 1} AND primary_user_id = $${values.length} AND deleted_at IS NULL
                          RETURNING ${COLS}`, values);
  return rows[0] || false;
}

async function deleteFamilyMember(userId, id) {
  if (!userId) return null;
  const rows = await run(`UPDATE family_members SET deleted_at = now(), updated_at = now()
                            WHERE id = $1 AND primary_user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows[0] || false;
}

export { listFamily, getFamilyMember, ownsFamilyMember, addFamilyMember, updateFamilyMember, deleteFamilyMember, RELATIONSHIPS };
