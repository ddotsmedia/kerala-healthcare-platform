export async function POST(req) {
  try {
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }
}
