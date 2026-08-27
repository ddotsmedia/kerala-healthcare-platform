import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'all'
  const search = url.searchParams.get('search') || ''

  try {
    let query = 'SELECT al.id, al.action, u.full_name as admin_name, al.target_id, al.details, al.created_at FROM audit_logs al JOIN users u ON al.admin_id = u.id WHERE al.deleted_at IS NULL'
    if (type !== 'all') query +=  AND al.action = '\'
    if (search) query +=  AND (al.details ILIKE '%' || \ || '%' OR u.full_name ILIKE '%' || \ || '%')
    query += ' ORDER BY al.created_at DESC LIMIT 100'

    const results = await sql(query, search ? [search] : [])
    return Response.json(results)
  } catch (error) {
    console.error('Audit log error:', error)
    return Response.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
