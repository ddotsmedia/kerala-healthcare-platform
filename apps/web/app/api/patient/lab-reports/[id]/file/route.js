// GET /api/patient/lab-reports/[id]/file — stream the stored file (owner only).
import { currentPatientId } from '@/lib/appointments';
import { getLabReportFile } from '@/lib/labReports';

export const dynamic = 'force-dynamic';
const MIME = { jpg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf' };

export async function GET(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return new Response('Unauthorized', { status: 401 });
  const { id } = await ctx.params;
  const row = await getLabReportFile(uid, id);
  if (!row || !row.file_url) return new Response('Not found', { status: 404 });
  const m = /^data:([^;]+);base64,(.*)$/s.exec(row.file_url);
  if (!m) return new Response('Invalid file', { status: 422 });
  const buf = Buffer.from(m[2], 'base64');
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': m[1] || MIME[row.file_type] || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${(row.file_name || 'lab-report').replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store'
    }
  });
}
