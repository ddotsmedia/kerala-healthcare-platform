import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'pending'

  try {
    let query = 'SELECT id, user_id, content_id, content, content_type, reason, status, created_at FROM moderation_reports WHERE deleted_at IS NULL'
    if (status !== 'all') query +=  AND status = '\'
    query += ' ORDER BY created_at DESC LIMIT 50'

    const results = await sql(query)
    return Response.json(results)
  } catch (error) {
    console.error('Moderation query error:', error)
    return Response.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
