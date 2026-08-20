// GET /api/import/[id]/errors — download the error report as CSV.

import { requireAdminRole } from '@/lib/auth';
import { getJob } from '@/lib/importJobs';

export const dynamic = 'force-dynamic';

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET(_request, props) {
  if (!(await requireAdminRole())) return new Response('Forbidden', { status: 403 });
  const { id } = await props.params;
  const job = await getJob(id);
  if (!job) return new Response('Not found', { status: 404 });
  const errors = Array.isArray(job.errors) ? job.errors.map((e) => (typeof e === 'string' ? JSON.parse(e) : e)) : [];
  const lines = ['row,field,error_message', ...errors.map((e) => [e.row, e.field, e.error_message].map(esc).join(','))];
  return new Response(`${lines.join('\n')}\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="import-${id}-errors.csv"`
    }
  });
}
