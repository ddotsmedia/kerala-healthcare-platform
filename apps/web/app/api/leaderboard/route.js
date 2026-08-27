import { sql } from '@khp/db';

export async function GET(req) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  try {
    const result = await sql`
      SELECT
        u.id,
        u.full_name as name,
        g.level,
        g.points
      FROM user_gamification g
      JOIN users u ON g.user_id = u.id
      ORDER BY g.points DESC
      LIMIT ${Math.min(limit, 100)}
    `;

    return Response.json(result);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
