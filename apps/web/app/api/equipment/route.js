import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  try {
    const equipment = await sql`
      SELECT
        id,
        name,
        description,
        category,
        daily_rental_rate,
        stock_available,
        specifications,
        image_url,
        rating,
        total_rentals,
        created_at
      FROM medical_equipment
      WHERE stock_available > 0 AND active = true AND deleted_at IS NULL
      ORDER BY rating DESC, total_rentals DESC
      LIMIT 50
    `

    return Response.json({ data: equipment })
  } catch (error) {
    console.error('Equipment error:', error)
    return Response.json({ error: 'Failed to fetch equipment' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { equipment_id, rental_start_date, rental_end_date, delivery_address } = await req.json()

    const equipment = await sql`
      SELECT name, daily_rental_rate FROM medical_equipment WHERE id = ${equipment_id}
    `

    const rental = await sql`
      INSERT INTO equipment_rentals (patient_id, equipment_id, rental_start_date, rental_end_date, delivery_address, status)
      VALUES (${session.userId}, ${equipment_id}, ${rental_start_date}, ${rental_end_date}, ${delivery_address}, 'pending')
      RETURNING id, status
    `

    const days = Math.ceil((new Date(rental_end_date) - new Date(rental_start_date)) / (1000 * 60 * 60 * 24))
    const total_cost = days * (equipment[0]?.daily_rental_rate || 0)

    return Response.json({
      ok: true,
      rental: rental[0],
      equipment_name: equipment[0]?.name,
      total_cost
    })
  } catch (error) {
    console.error('Rent equipment error:', error)
    return Response.json({ error: 'Failed to book equipment rental' }, { status: 500 })
  }
}
