import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import os from 'node:os';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session?.role?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const mem = process.memoryUsage();
  const osMem = os.totalmem();
  const osFreeMem = os.freemem();

  return NextResponse.json({
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
      note: 'as reported by Node'
    },
    loadavg: os.loadavg(),
    cpuCount: os.cpus().length,
    totalMemMB: Math.round(osMem / 1024 / 1024),
    freeMemMB: Math.round(osFreeMem / 1024 / 1024)
  }, { headers: { 'Cache-Control': 'no-store' } });
}
