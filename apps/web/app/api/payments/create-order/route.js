import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { amount, currency = 'INR', description, reference_type, reference_id } = await req.json()

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        notes: { reference_type, reference_id, user_id: session.userId }
      })
    })

    if (!razorpayRes.ok) {
      console.error('Razorpay error:', await razorpayRes.text())
      return Response.json({ error: 'Payment gateway error' }, { status: 500 })
    }

    const razorpayOrder = await razorpayRes.json()

    const payment = await sql`
      INSERT INTO payments (user_id, amount, currency, gateway, status, transaction_id, reference_type, reference_id)
      VALUES (${session.userId}, ${amount}, ${currency}, 'razorpay', 'pending', ${razorpayOrder.id}, ${reference_type}, ${reference_id})
      RETURNING id, transaction_id
    `

    return Response.json({
      ok: true,
      order_id: razorpayOrder.id,
      amount,
      currency,
      key_id: RAZORPAY_KEY_ID,
      user_id: session.userId,
      description
    })
  } catch (error) {
    console.error('Payment error:', error)
    return Response.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
