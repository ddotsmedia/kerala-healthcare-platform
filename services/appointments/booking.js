// booking.js — concurrency-safe slot booking. The partial UNIQUE index on
// (provider_id, slot_date, slot_start) WHERE status='confirmed' is the source of
// truth for double-booking prevention; ON CONFLICT DO NOTHING makes the insert
// atomic. Parameterised SQL only.

import { randomBytes, randomUUID } from 'node:crypto';
import { getPool } from '@khp/db';
import { del } from '@khp/cache';
import { toMinutes, toTime } from './time.js';

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** 10-char human-friendly booking reference. */
function generateBookingRef() {
  const bytes = randomBytes(10);
  let ref = '';
  for (let i = 0; i < 10; i++) ref += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return ref;
}

/** Find the template covering startTime to derive slot end + mode. */
async function resolveSlot(client, providerId, date, startTime) {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  const { rows } = await client.query(
    `SELECT start_time, end_time, slot_duration_minutes, consultation_mode
       FROM availability_templates
      WHERE provider_id = $1 AND day_of_week = $2 AND is_active = true AND deleted_at IS NULL`,
    [providerId, dow]
  );
  const s = toMinutes(startTime);
  for (const t of rows) {
    if (s >= toMinutes(t.start_time) && s + t.slot_duration_minutes <= toMinutes(t.end_time)) {
      return { end: toTime(s + t.slot_duration_minutes), mode: t.consultation_mode };
    }
  }
  return null;
}

const APPT_COLS = 'id, booking_ref, slot_date, slot_start, slot_end, consultation_mode, consultation_room, status';

/**
 * Book a slot atomically.
 * @param {string} [idempotencyKey] when set, a repeat with the same key returns
 *   the original appointment instead of booking again.
 * @returns {Promise<{ok:true, appointment:object, replayed?:boolean} | {ok:false, error:string}>}
 */
async function bookSlot(providerId, patientId, date, startTime, mode, idempotencyKey) {
  const pool = getPool();

  if (idempotencyKey) {
    const prior = await pool.query(
      `SELECT ${APPT_COLS} FROM appointments WHERE idempotency_key = $1`, [idempotencyKey]
    );
    if (prior.rows.length) return { ok: true, appointment: prior.rows[0], replayed: true };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize concurrent bookings for the same provider.
    await client.query('SELECT id FROM doctors WHERE id = $1 FOR UPDATE', [providerId]);

    const slot = await resolveSlot(client, providerId, date, startTime);
    if (!slot) {
      await client.query('ROLLBACK');
      return { ok: false, error: 'slot_not_available' };
    }
    const useMode = mode || slot.mode;
    const room = useMode === 'video' ? randomUUID() : null;
    const ref = generateBookingRef();

    const { rows } = await client.query(
      `INSERT INTO appointments
         (booking_ref, provider_id, patient_id, slot_date, slot_start, slot_end,
          consultation_mode, status, consultation_room, idempotency_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed',$8,$9)
       ON CONFLICT (provider_id, slot_date, slot_start) WHERE status = 'confirmed'
       DO NOTHING
       RETURNING ${APPT_COLS}`,
      [ref, providerId, patientId, date, startTime, slot.end, useMode, room, idempotencyKey || null]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return { ok: false, error: 'slot_taken' };
    }
    await client.query('COMMIT');
    del(`slots:${providerId}:${date}`); // invalidate slot cache for this provider/date
    return { ok: true, appointment: rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    return { ok: false, error: err.message };
  } finally {
    client.release();
  }
}

export { bookSlot, generateBookingRef };
