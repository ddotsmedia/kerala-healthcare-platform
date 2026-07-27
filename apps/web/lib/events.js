// events.js — health camps & community events. Public read-only + ICS export.

import { getPool } from '@khp/db';

export const EVENT_TYPES = ['screening_camp', 'blood_donation', 'vaccination', 'awareness', 'cme', 'wellness'];
const VISIBLE = `e.deleted_at IS NULL AND e.status <> 'cancelled'`;
const LIST_COLS = `e.id, e.slug, e.title_ml, e.title_en, e.type, e.organiser,
  e.venue_ml, e.venue_en, e.event_date, e.start_time, e.end_time,
  e.is_free, e.registration_required, e.status,
  d.name_ml AS district_ml, d.name_en AS district_en`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`events query failed: ${err.message}`); return []; }
}

/**
 * Upcoming events with filters. @param {object} o { type, districtId, when, free, page, limit }
 * `when` = 'week' | 'month'. `free` = '1' (free only) | '0' (paid only).
 */
export function listEvents({ type, districtId, when, free, page = 1, limit = 12 } = {}) {
  const where = [VISIBLE, `e.event_date >= current_date`];
  const values = [];
  if (type && EVENT_TYPES.includes(type)) { values.push(type); where.push(`e.type = $${values.length}`); }
  if (districtId) { values.push(districtId); where.push(`e.district_id = $${values.length}`); }
  if (when === 'week') where.push(`e.event_date <= current_date + 7`);
  else if (when === 'month') where.push(`e.event_date <= current_date + 30`);
  if (free === '1') where.push(`e.is_free = true`);
  else if (free === '0') where.push(`e.is_free = false`);
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(
    `SELECT ${LIST_COLS} FROM health_events e LEFT JOIN districts d ON d.id = e.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY e.event_date ASC, e.start_time ASC NULLS LAST
      LIMIT $${li} OFFSET $${oi}`, values);
}

export function getEvent(slug) {
  return run(
    `SELECT e.id, e.slug, e.title_ml, e.title_en, e.type, e.organiser,
            e.venue_ml, e.venue_en, e.event_date, e.start_time, e.end_time,
            e.is_free, e.registration_required, e.registration_url, e.contact_phone,
            e.description_ml, e.description_en, e.max_participants, e.current_registrations, e.status,
            d.name_ml AS district_ml, d.name_en AS district_en,
            h.name_ml AS hospital_ml, h.name_en AS hospital_en, h.slug AS hospital_slug
       FROM health_events e
       LEFT JOIN districts d ON d.id = e.district_id
       LEFT JOIN hospitals h ON h.id = e.hospital_id
      WHERE e.slug = $1 AND e.deleted_at IS NULL`, [slug]).then((r) => r[0] || null);
}

export function allEventSlugs() {
  return run(
    `SELECT slug FROM health_events
      WHERE deleted_at IS NULL AND status <> 'cancelled' AND event_date >= current_date
      ORDER BY event_date`, []);
}

function icsStamp(date, time, fallback) {
  const d = String(date).slice(0, 10).replace(/-/g, '');
  const t = (time ? String(time).slice(0, 5) : fallback).replace(':', '') + '00';
  return `${d}T${t}`;
}

function icsEscape(s = '') {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Build a minimal, valid VCALENDAR for one event (local Kerala time, floating). */
export function eventToIcs(e, siteUrl) {
  const title = e.title_en || e.title_ml || 'Health Event';
  const venue = [e.venue_en || e.venue_ml, e.district_en].filter(Boolean).join(', ');
  const desc = [e.description_en || e.description_ml, e.organiser && `Organiser: ${e.organiser}`, siteUrl]
    .filter(Boolean).join('\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MalayaliDoctor//Health Events//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${e.id}@malayalidoctor.com`,
    `SUMMARY:${icsEscape(title)}`,
    `DTSTART:${icsStamp(e.event_date, e.start_time, '0900')}`,
    `DTEND:${icsStamp(e.event_date, e.end_time, '1700')}`,
    venue && `LOCATION:${icsEscape(venue)}`,
    `DESCRIPTION:${icsEscape(desc)}`,
    'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
  ].filter(Boolean);
  return lines.join('\r\n');
}
