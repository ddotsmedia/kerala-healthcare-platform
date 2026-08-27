import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const policies = await sql`
      SELECT
        id,
        provider_name,
        policy_number,
        coverage_amount,
        premium_amount,
        start_date,
        expiry_date,
        status,
        coverage_details,
        created_at
      FROM user_insurance_policies
      WHERE user_id = ${session.userId}
      AND deleted_at IS NULL
      ORDER BY expiry_date DESC
    `

    return Response.json({ data: policies })
  } catch (error) {
    console.error('Insurance policies error:', error)
    return Response.json({ error: 'Failed to fetch policies' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const {
      provider_name,
      policy_number,
      coverage_amount,
      premium_amount,
      start_date,
      expiry_date,
      coverage_details
    } = await req.json()

    const result = await sql`
      INSERT INTO user_insurance_policies
      (user_id, provider_name, policy_number, coverage_amount, premium_amount, start_date, expiry_date, status, coverage_details)
      VALUES (${session.userId}, ${provider_name}, ${policy_number}, ${coverage_amount}, ${premium_amount}, ${start_date}, ${expiry_date}, 'active', ${JSON.stringify(coverage_details)})
      RETURNING id, policy_number, status
    `

    return Response.json({ ok: true, policy: result[0] })
  } catch (error) {
    console.error('Add policy error:', error)
    return Response.json({ error: 'Failed to add policy' }, { status: 500 })
  }
}
