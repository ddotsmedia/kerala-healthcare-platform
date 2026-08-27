import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const filter = url.searchParams.get('filter') || 'all'

  try {
    let query = 'SELECT id, full_name, email, role, approved, banned, created_at FROM users WHERE deleted_at IS NULL'
    if (search) query +=  AND (full_name ILIKE '%' || \ || '%' OR email ILIKE '%' || \ || '%')
    if (filter === 'active') query += ' AND approved = true AND banned = false'
    if (filter === 'banned') query += ' AND banned = true'
    if (filter === 'pending') query += ' AND approved = false'
    query += ' ORDER BY created_at DESC LIMIT 100'

    const results = await sql(query, search ? [search] : [])
    return Response.json(results)
  } catch (error) {
    console.error('User query error:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
