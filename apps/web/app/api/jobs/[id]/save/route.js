// POST/DELETE /api/jobs/[id]/save — candidate bookmarks a job.
import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { currentCandidateProfile } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

async function candidateId() {
  const c = await currentCandidateProfile();
  return c ? c.id : null;
}

export async function POST(request, ctx) {
  const cid = await candidateId();
  if (!cid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await getPool().query(
      `INSERT INTO saved_jobs (candidate_id, job_id) VALUES ($1, $2) ON CONFLICT (candidate_id, job_id) DO NOTHING`,
      [cid, id]);
  } catch { return NextResponse.json({ data: null, meta: null, errors: ['save_failed'] }, { status: 400 }); }
  return NextResponse.json({ data: { saved: true }, meta: null, errors: null }, { status: 201 });
}

export async function DELETE(request, ctx) {
  const cid = await candidateId();
  if (!cid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  await getPool().query(`DELETE FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2`, [cid, id]);
  return NextResponse.json({ data: { saved: false }, meta: null, errors: null });
}
