import { sql } from '@khp/db'
import crypto from 'crypto'

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await sql`
      UPDATE payments
      SET status = 'completed', transaction_id = ${razorpay_payment_id}, updated_at = NOW()
      WHERE transaction_id = ${razorpay_order_id}
    `

    return Response.json({
      ok: true,
      status: 'payment_verified',
      order_id: razorpay_order_id
    })
  } catch (error) {
    console.error('Verification error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
