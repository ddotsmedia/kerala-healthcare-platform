// GET /api/resume/[id]/export — print-ready standalone HTML for browser PDF.
// ?template=modern_minimal&locale=en&print=1 optional overrides.
import { getResumeById, touchExport } from '@/lib/resume';
import { renderResumeDoc } from '@/lib/resumeRender';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { id } = await ctx.params;
  const resume = await getResumeById(id);
  if (resume === null) return new Response('Unauthorized', { status: 401 });
  if (!resume) return new Response('Not found', { status: 404 });

  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || resume.template_id;
  const locale = searchParams.get('locale') === 'en' ? 'en' : 'ml';
  const html = renderResumeDoc(resume, template, locale, { print: searchParams.get('print') === '1' });

  await touchExport(id);
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
