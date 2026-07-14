// POST /api/admin/news — create a news item (admin only).
import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { createNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  const r = await createNews(body);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: 400 });
  return NextResponse.json({ data: { id: r.id }, meta: null, errors: null }, { status: 201 });
}
