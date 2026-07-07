// POST /api/resume/[id]/enhance — AI-enhance the professional summary (Haiku).
// Rate limit: 10 enhancements per user per day. Returns before/after; does NOT
// auto-save — the user accepts or edits, then PATCH persists ai_enhanced_summary.
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getResumeById } from '@/lib/resume';
import { rateLimit } from '@khp/ratelimit';
import { enhanceResumeSummary, logInteraction, MODEL } from '@khp/ai-assistant';

export const dynamic = 'force-dynamic';
const DAILY_LIMIT = 10;

function err(msg, status, headers) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status, headers }); }

export async function POST(request, ctx) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session) return err('unauthenticated', 401);

  const body = await request.json().catch(() => ({}));
  const locale = body.locale === 'en' ? 'en' : 'ml';

  const rl = rateLimit(`resume-enhance:${session.userId}`, DAILY_LIMIT, 86400);
  if (!rl.allowed) return err('rate_limit_exceeded', 429, { 'Retry-After': String(rl.retryAfter) });

  const resume = await getResumeById(id);
  if (!resume) return err('not_found', 404);

  const before = resume.ai_enhanced_summary || (resume.personal && resume.personal.objective) || '';
  const after = await enhanceResumeSummary(resume, locale);
  if (!after) return err('ai_unavailable', 503);

  await logInteraction({
    sessionId: `resume:${id}`, input: 'resume-enhance', responseLength: after.length,
    model: MODEL, ragSourceIds: [], locale, flags: ['resume_enhance']
  });

  return NextResponse.json({ data: { before, after, model: 'ai_generated' }, meta: { remaining: rl.remaining }, errors: null });
}
