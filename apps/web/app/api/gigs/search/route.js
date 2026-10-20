import { getPool } from '@khp/db';
import { rateLimit } from '@khp/ratelimit';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';
  const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
  const offset = Math.max(parseInt(searchParams.get('offset')) || 0, 0);

  await rateLimit(req.ip || '127.0.0.1', 'gigs-search', 50, 3600);

  try {
    const pool = getPool();
    const whereClause = [];
    const params = [];

    whereClause.push('g.status = $1');
    params.push('open');

    if (q) {
      whereClause.push(`(g.title ILIKE $${params.length + 1} OR g.description ILIKE $${params.length + 1})`);
      params.push(`%${q}%`);
    }

    if (city) {
      whereClause.push(`g.city ILIKE $${params.length + 1}`);
      params.push(`%${city}%`);
    }

    params.push(limit);
    params.push(offset);

    const { rows: gigs } = await pool.query(
      `SELECT
        g.id, g.title, g.description, g.specialty, g.location, g.city,
        g.start_date, g.end_date, g.hourly_rate, g.shift_type,
        g.experience_required, g.required_qualifications,
        d.full_name as doctor_name,
        COUNT(gb.id) as total_applications
      FROM gigs g
      JOIN doctors d ON g.doctor_id = d.id
      LEFT JOIN gig_bookings gb ON g.id = gb.gig_id AND gb.deleted_at IS NULL
      WHERE ${whereClause.join(' AND ')} AND g.deleted_at IS NULL
      GROUP BY g.id, d.id
      ORDER BY g.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countResult } = await pool.query(
      `SELECT COUNT(*) as total FROM gigs g
      WHERE ${whereClause.slice(0, -2).join(' AND ') || 'g.status = $1'} AND g.deleted_at IS NULL`,
      params.slice(0, -2)
    );

    return Response.json({
      items: gigs || [],
      total: parseInt(countResult[0]?.total) || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Gigs search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
