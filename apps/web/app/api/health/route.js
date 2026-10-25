// GET /api/health — public monitoring endpoint. 200 if DB reachable, else 503.

import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';

export const dynamic = 'force-dynamic';

async function checkDb() {
  try { await getPool().query('SELECT 1'); return true; }
  catch { return false; }
}

export async function GET() {
  const dbOk = await checkDb();
  const uptime = Math.floor(process.uptime());
  const status = dbOk ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      dbOk,
      uptimeSeconds: uptime,
      version: process.env.GIT_SHA || 'unknown'
    },
    { status: dbOk ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
