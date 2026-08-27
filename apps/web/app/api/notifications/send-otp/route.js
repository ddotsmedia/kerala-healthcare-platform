import { sql } from '@khp/db'

const OTP_SMS_GATEWAY_URL = process.env.OTP_SMS_GATEWAY_URL || ''
const OTP_SMS_API_KEY = process.env.OTP_SMS_API_KEY || ''

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req) {
  try {
    const { mobile_number, email, type = 'login' } = await req.json()

    if (!mobile_number && !email) {
      return Response.json({ error: 'Mobile or email required' }, { status: 400 })
    }

    const otp = generateOTP()
    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    const notification = await sql`
      INSERT INTO notification_logs (recipient, channel, template_id, content, status, expires_at)
      VALUES (
        ${mobile_number || email},
        ${mobile_number ? 'sms' : 'email'},
        ${type === 'login' ? 'otp_login' : 'otp_verify'},
        ${JSON.stringify({ otp, type })},
        'pending',
        ${expiry.toISOString()}
      )
      RETURNING id
    `

    if (mobile_number && OTP_SMS_GATEWAY_URL) {
      const smsRes = await fetch(`${OTP_SMS_GATEWAY_URL}/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OTP_SMS_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mobile_number,
          message: `Your OTP is ${otp}. Valid for 10 minutes.`
        })
      }).catch(() => null)

      if (smsRes?.ok) {
        await sql`UPDATE notification_logs SET status = 'sent' WHERE id = ${notification[0].id}`
      }
    }

    return Response.json({
      ok: true,
      notification_id: notification[0].id,
      expires_in: 600
    })
  } catch (error) {
    console.error('OTP error:', error)
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
