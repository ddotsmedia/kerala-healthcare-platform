import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''

  try {
    const medicines = await sql`
      SELECT
        id,
        name,
        dosage,
        form,
        manufacturer,
        price,
        stock_quantity,
        requires_prescription,
        side_effects,
        uses,
        rating,
        image_url,
        created_at
      FROM medicines
      WHERE active = true AND deleted_at IS NULL
      ${search ? sql`AND (name ILIKE ${'%' + search + '%'} OR manufacturer ILIKE ${'%' + search + '%'})` : sql``}
      ORDER BY rating DESC
      LIMIT 50
    `

    return Response.json({ data: medicines })
  } catch (error) {
    console.error('Medicines error:', error)
    return Response.json({ error: 'Failed to fetch medicines' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { medicine_id, quantity, pharmacy_id, notes } = await req.json()

    const medicine = await sql`
      SELECT name, price, requires_prescription FROM medicines WHERE id = ${medicine_id}
    `

    const order = await sql`
      INSERT INTO medicine_orders (patient_id, medicine_id, quantity, pharmacy_id, status, notes)
      VALUES (${session.userId}, ${medicine_id}, ${quantity}, ${pharmacy_id}, 'pending', ${notes})
      RETURNING id, status
    `

    const total_cost = quantity * (medicine[0]?.price || 0)

    return Response.json({
      ok: true,
      order: order[0],
      medicine_name: medicine[0]?.name,
      total_cost,
      requires_prescription: medicine[0]?.requires_prescription
    })
  } catch (error) {
    console.error('Order medicine error:', error)
    return Response.json({ error: 'Failed to order medicine' }, { status: 500 })
  }
}
