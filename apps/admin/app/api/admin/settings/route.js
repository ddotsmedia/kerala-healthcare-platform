import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sqlSELECT * FROM system_settings LIMIT 1
    return Response.json(result[0] || {})
  } catch (error) {
    console.error('Settings error:', error)
    return Response.json({ siteName: 'MalayaliDoctor', supportEmail: 'support@malayalidoctor.com' })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { settings, changed } = await req.json()

  try {
    await sqlINSERT INTO audit_logs (id, admin_id, action, target_id, details, created_at) VALUES (uuid_generate_v4(), \, 'settings_changed', NULL, \, NOW()) ON CONFLICT DO NOTHING
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return Response.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
