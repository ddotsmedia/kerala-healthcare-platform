import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const filter = url.searchParams.get('filter') || 'pending'

  try {
    let query = 'SELECT id, full_name, specialty, license_number, medical_council, experience_years, verified FROM doctors WHERE deleted_at IS NULL'
    if (filter === 'pending') query += ' AND verified = false'
    if (filter === 'verified') query += ' AND verified = true'
    if (filter === 'rejected') query += ' AND rejected = true'
    query += ' ORDER BY created_at DESC LIMIT 50'

    const results = await sql(query)
    return Response.json(results)
  } catch (error) {
    console.error('Doctor query error:', error)
    return Response.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}
