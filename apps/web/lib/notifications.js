// notifications.js — notification helper for appointments and events
import { getPool } from '@khp/db';

export async function sendNotification(userId, message, type = 'info', data = {}) {
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO notification_logs (user_id, message, type, data, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT DO NOTHING`,
      [userId, message, type, JSON.stringify(data)]
    );
  } catch (error) {
    console.error('Notification error:', error);
  }
}

export async function getNotifications(userId) {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, message, type, data, created_at FROM notification_logs
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
}
