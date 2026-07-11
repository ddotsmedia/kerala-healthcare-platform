// video.js — Jitsi Meet room helpers. No infra: rooms live on meet.jit.si.
// Room name is deterministic per appointment so both parties land in the same room.

import { getPool } from '@khp/db';

const JITSI_HOST = process.env.JITSI_HOST || 'https://meet.jit.si';

/** Deterministic room name for an appointment. */
function jitsiRoomName(a) {
  if (a && a.jitsi_room_name) return a.jitsi_room_name;
  const seed = (a && (a.consultation_room || a.id)) || '';
  return `khp-${String(seed).replace(/-/g, '').slice(0, 24)}`;
}

function jitsiUrl(roomName) { return `${JITSI_HOST}/${roomName}`; }

/** Room descriptor for an appointment. Persists jitsi_room_name if missing. */
async function generateJitsiRoom(appointmentId) {
  try {
    const { rows } = await getPool().query(
      `SELECT id, consultation_room, jitsi_room_name FROM appointments WHERE id = $1`, [appointmentId]);
    const a = rows[0];
    if (!a) return null;
    const roomName = jitsiRoomName(a);
    if (!a.jitsi_room_name) {
      await getPool().query(`UPDATE appointments SET jitsi_room_name = $2, updated_at = now() WHERE id = $1`, [appointmentId, roomName]);
    }
    return { roomName, url: jitsiUrl(roomName), host: JITSI_HOST };
  } catch (err) { console.error(`generateJitsiRoom failed: ${err.message}`); return null; }
}

/**
 * Placeholder JWT config — plain meet.jit.si needs no auth. For production use
 * 8x8.vc or a self-hosted deployment with a signed JWT. Returns null for now.
 */
function generateJWTConfig() { return null; }

async function startConsultation(appointmentId) {
  try {
    await getPool().query(
      `UPDATE appointments SET consultation_started_at = COALESCE(consultation_started_at, now()), updated_at = now()
        WHERE id = $1`, [appointmentId]);
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
}

/** End the call; a doctor ending it also marks the appointment completed. */
async function endConsultation(appointmentId, byRole) {
  try {
    const setStatus = byRole === 'doctor' ? ", status = CASE WHEN status = 'confirmed' THEN 'completed' ELSE status END" : '';
    await getPool().query(
      `UPDATE appointments SET consultation_ended_at = now(), updated_at = now()${setStatus} WHERE id = $1`, [appointmentId]);
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
}

export { jitsiRoomName, jitsiUrl, generateJitsiRoom, generateJWTConfig, startConsultation, endConsultation, JITSI_HOST };
