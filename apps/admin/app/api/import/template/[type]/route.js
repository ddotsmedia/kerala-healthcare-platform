// GET /api/import/template/[type] — download an example CSV with correct headers.
// [type] is "doctors" or "hospitals" (a trailing .csv is tolerated).

import { requireAdminRole } from '@/lib/auth';
import { templateCSV, IMPORT_COLUMNS } from '@/lib/import';

export const dynamic = 'force-dynamic';

export async function GET(_request, props) {
  if (!(await requireAdminRole())) return new Response('Forbidden', { status: 403 });
  const { type: raw } = await props.params;
  const type = String(raw || '').replace(/\.csv$/i, '');
  if (!IMPORT_COLUMNS[type]) return new Response('Unknown type', { status: 404 });
  return new Response(templateCSV(type), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type}-template.csv"`
    }
  });
}
