import { getUserGamification } from '@/lib/gamification';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const gamif = await getUserGamification(session.userId);
    return Response.json(gamif);
  } catch (error) {
    console.error('Get gamification error:', error);
    return Response.json({ error: 'Failed to fetch gamification' }, { status: 500 });
  }
}
