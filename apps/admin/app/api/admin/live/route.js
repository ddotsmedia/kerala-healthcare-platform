// GET /api/admin/live — Server-Sent Events stream of live stats + notifications.
// Pushes every 15s; ~10 min max lifetime (the client auto-reconnects).
import { requireAdminRole } from '@/lib/auth';
import { liveStats, recentEvents } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

const PERIOD_MS = 15000;
const MAX_TICKS = 40;

export async function GET() {
  if (!(await requireAdminRole())) return new Response('forbidden', { status: 403 });

  const encoder = new TextEncoder();
  let timer;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, payload) => {
        try { controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)); }
        catch { /* closed */ }
      };
      const tick = async () => {
        const [stats, feed] = await Promise.all([liveStats(), recentEvents(20)]);
        send('stats', stats);
        send('notifications', feed);
      };
      await tick();
      let n = 0;
      timer = setInterval(async () => {
        n += 1;
        await tick();
        if (n >= MAX_TICKS) { clearInterval(timer); try { controller.close(); } catch { /* noop */ } }
      }, PERIOD_MS);
    },
    cancel() { if (timer) clearInterval(timer); }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
