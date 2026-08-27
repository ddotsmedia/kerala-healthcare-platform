import { awardPoints } from '@/lib/gamification';
import { getSession } from '@/lib/auth';

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { activity } = await req.json();
  if (!activity) {
    return Response.json({ error: 'Activity required' }, { status: 400 });
  }

  try {
    await awardPoints(session.userId, activity);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ error: 'Failed to award points' }, { status: 500 });
  }
}
