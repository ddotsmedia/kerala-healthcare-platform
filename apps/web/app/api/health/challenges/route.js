import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  try {
    const challenges = await sql`
      SELECT
        id,
        name,
        description,
        emoji,
        target_days,
        reward_points,
        active,
        created_at
      FROM health_challenges
      WHERE active = true AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 20
    `

    return Response.json({ data: challenges })
  } catch (error) {
    console.error('Challenges error:', error)
    return Response.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { challenge_id } = await req.json()

    const result = await sql`
      INSERT INTO user_challenge_participation (user_id, challenge_id, started_at, status)
      VALUES (${session.userId}, ${challenge_id}, NOW(), 'in_progress')
      ON CONFLICT DO NOTHING
      RETURNING id, status
    `

    if (!result[0]) {
      return Response.json({ error: 'Already joined challenge' }, { status: 400 })
    }

    const challenge = await sql`
      SELECT reward_points FROM health_challenges WHERE id = ${challenge_id}
    `

    return Response.json({
      ok: true,
      status: 'joined',
      reward_points: challenge[0]?.reward_points || 0
    })
  } catch (error) {
    console.error('Join challenge error:', error)
    return Response.json({ error: 'Failed to join challenge' }, { status: 500 })
  }
}
