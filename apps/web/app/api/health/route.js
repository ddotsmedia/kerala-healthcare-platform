// GET /api/health — public monitoring endpoint. 200 if DB + Redis reachable, else 503.

import net from 'node:net';
import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';

export const dynamic = 'force-dynamic';

async function checkDb() {
  try { await getPool().query('SELECT 1'); return 'ok'; }
  catch { return 'error'; }
}

function checkRedis() {
  return new Promise((resolve) => {
    try {
      const url = new URL(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
      const sock = net.createConnection({ host: url.hostname, port: Number(url.port) || 6379 });
      const done = (ok) => { try { sock.destroy(); } catch { /* noop */ } resolve(ok ? 'ok' : 'error'); };
      sock.setTimeout(1000);
      sock.once('connect', () => done(true));
      sock.once('timeout', () => done(false));
      sock.once('error', () => done(false));
    } catch { resolve('error'); }
  });
}

export async function GET() {
  const [database, redis] = await Promise.all([checkDb(), checkRedis()]);
  const ok = database === 'ok' && redis === 'ok';
  return NextResponse.json(
    { status: ok ? 'ok' : 'degraded', timestamp: new Date().toISOString(), version: '1.0.0', checks: { database, redis } },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
