import { getPool } from '@khp/db';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@khp/ratelimit';

export async function GET(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId');
  const specialty = searchParams.get('specialty') || '';
  const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
  const offset = Math.max(parseInt(searchParams.get('offset')) || 0, 0);

  await rateLimit(session.userId, 'appointments-search', 100, 3600);

  try {
    const pool = getPool();
    const params = ['booked', 'confirmed'];
    const whereClause = ['a.status = ANY($1)'];

    if (doctorId) {
      whereClause.push(`a.doctor_id = $${params.length + 1}`);
      params.push(doctorId);
    }

    if (specialty) {
      whereClause.push(`d.specialty ILIKE $${params.length + 1}`);
      params.push(`%${specialty}%`);
    }

    whereClause.push('a.deleted_at IS NULL');

    params.push(limit);
    params.push(offset);

    const { rows: appointments } = await pool.query(
      `SELECT
        a.id, a.patient_id, a.doctor_id, a.starts_at, a.status, a.mode, a.fee,
        d.full_name as doctor_name, d.specialty,
        p.first_name, p.last_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      WHERE ${whereClause.join(' AND ')}
      ORDER BY a.starts_at ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countResult } = await pool.query(
      `SELECT COUNT(*) as total FROM appointments a
      WHERE a.status = ANY($1) AND a.deleted_at IS NULL`,
      [['booked', 'confirmed']]
    );

    return Response.json({
      items: appointments || [],
      total: parseInt(countResult[0]?.total) || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Appointments search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
