import { getRecommendations } from '@/lib/recommendations';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recs = await getRecommendations(session.userId);
    return Response.json(recs);
  } catch (error) {
    console.error('Recommendations error:', error);
    return Response.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
