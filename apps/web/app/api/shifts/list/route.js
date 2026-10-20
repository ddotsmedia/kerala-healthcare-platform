import { getPool } from '@khp/db';
import { rateLimit } from '@khp/ratelimit';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';
  const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
  const offset = Math.max(parseInt(searchParams.get('offset')) || 0, 0);

  await rateLimit(req.ip || '127.0.0.1', 'shifts-list', 50, 3600);

  try {
    const pool = getPool();
    const whereClause = [];
    const params = [];

    whereClause.push('ss.status = $1');
    params.push('open');

    if (q) {
      whereClause.push(`ss.specialty ILIKE $${params.length + 1}`);
      params.push(`%${q}%`);
    }

    if (city) {
      whereClause.push(`h.city ILIKE $${params.length + 1}`);
      params.push(`%${city}%`);
    }

    params.push(limit);
    params.push(offset);

    const { rows: shifts } = await pool.query(
      `SELECT
        ss.id, ss.specialty, ss.shift_date, ss.start_time, ss.end_time,
        ss.shift_type, ss.available_slots, ss.filled_slots, ss.hourly_rate,
        ss.requirements,
        h.id as hospital_id, h.name as hospital_name,
        COUNT(la.id) as total_assigned
      FROM shift_slots ss
      JOIN hospitals h ON ss.hospital_id = h.id
      LEFT JOIN locum_assignments la ON ss.id = la.shift_slot_id AND la.deleted_at IS NULL AND la.status IN ('confirmed', 'pending')
      WHERE ${whereClause.join(' AND ')} AND ss.deleted_at IS NULL
      GROUP BY ss.id, h.id
      ORDER BY ss.shift_date ASC, ss.start_time ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countResult } = await pool.query(
      `SELECT COUNT(*) as total FROM shift_slots ss
      WHERE ${whereClause.slice(0, -2).join(' AND ') || 'ss.status = $1'} AND ss.deleted_at IS NULL`,
      params.slice(0, -2)
    );

    return Response.json({
      items: shifts || [],
      total: parseInt(countResult[0]?.total) || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Shifts list error:', error);
    return Response.json({ error: 'List failed' }, { status: 500 });
  }
}
