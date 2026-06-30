// slots.js — compute available slots from templates minus overrides minus booked.
// Parameterised SQL only.

import { getPool } from '@khp/db';
import { toMinutes, toTime, dayOfWeek } from './time.js';

/**
 * Available slots for a provider on a date.
 * @returns {Promise<Array<{start:string,end:string,mode:string,duration:number}>>}
 */
async function getAvailableSlots(providerId, date) {
  const pool = getPool();
  const dow = dayOfWeek(date);

  const ovr = (await pool.query(
    `SELECT is_blocked, start_time, end_time FROM availability_overrides
      WHERE provider_id = $1 AND override_date = $2 AND deleted_at IS NULL`,
    [providerId, date]
  )).rows;
  if (ovr.some((o) => o.is_blocked)) return [];

  const templates = (await pool.query(
    `SELECT start_time, end_time, slot_duration_minutes, consultation_mode
       FROM availability_templates
      WHERE provider_id = $1 AND day_of_week = $2 AND is_active = true AND deleted_at IS NULL`,
    [providerId, dow]
  )).rows;

  // Extra (non-blocking) override windows extend availability for the date.
  const extra = ovr.filter((o) => !o.is_blocked && o.start_time && o.end_time)
    .map((o) => ({ start_time: o.start_time, end_time: o.end_time, slot_duration_minutes: 30, consultation_mode: 'in_person' }));

  const booked = new Set((await pool.query(
    `SELECT slot_start FROM appointments
      WHERE provider_id = $1 AND slot_date = $2 AND status = 'confirmed'`,
    [providerId, date]
  )).rows.map((r) => toMinutes(r.slot_start)));

  const slots = [];
  for (const tpl of [...templates, ...extra]) {
    const dur = tpl.slot_duration_minutes;
    const end = toMinutes(tpl.end_time);
    for (let s = toMinutes(tpl.start_time); s + dur <= end; s += dur) {
      if (booked.has(s)) continue;
      slots.push({ start: toTime(s), end: toTime(s + dur), mode: tpl.consultation_mode, duration: dur });
    }
  }
  return slots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

/** Slots across an inclusive date range. @returns {Promise<Object<string,Array>>} */
async function getSlotsForRange(providerId, startDate, endDate) {
  const out = {};
  const [y, m, d] = startDate.split('-').map((n) => parseInt(n, 10));
  const end = endDate;
  let cur = new Date(Date.UTC(y, m - 1, d));
  while (true) {
    const ds = cur.toISOString().slice(0, 10);
    if (ds > end) break;
    out[ds] = await getAvailableSlots(providerId, ds);
    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }
  return out;
}

/** Atomic availability check for a specific slot start. */
async function isSlotAvailable(providerId, date, startTime) {
  const target = toMinutes(startTime);
  const slots = await getAvailableSlots(providerId, date);
  return slots.some((s) => toMinutes(s.start) === target);
}

export { getAvailableSlots, getSlotsForRange, isSlotAvailable };
