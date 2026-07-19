// POST /api/forum/action { kind:'post'|'reply', id, action:'approve'|'reject' }
import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { moderatePost, moderateReply } from '@/lib/forum';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const b = await request.json().catch(() => ({}));
  const action = b.action === 'reject' ? 'reject' : 'approve';
  if (!b.id) return NextResponse.json({ data: null, meta: null, errors: ['id_required'] }, { status: 400 });
  const ok = b.kind === 'reply' ? await moderateReply(b.id, action) : await moderatePost(b.id, action);
  return NextResponse.json({ data: ok ? { id: b.id, action } : null, meta: null, errors: ok ? null : ['not_found'] }, { status: ok ? 200 : 404 });
}
