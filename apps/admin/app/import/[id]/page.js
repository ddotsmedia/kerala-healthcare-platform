/* eslint-disable @next/next/no-html-link-for-pages */
// Import job details — row-by-row error status + fix-and-reimport instructions.

import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getJob } from '@/lib/importJobs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Import Job · KHP Admin' };

export default async function ImportJobPage(props) {
  if (!(await requireAdminRole())) redirect('/login');
  const { id } = await props.params;
  const job = await getJob(id);
  if (!job) notFound();
  const errors = Array.isArray(job.errors) ? job.errors.map((e) => (typeof e === 'string' ? JSON.parse(e) : e)) : [];

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500"><Link href="/import" className="hover:text-brand">Import</Link> › <span>{job.filename || id.slice(0, 8)}</span></nav>
      <h2 className="text-lg font-bold text-gray-900">Import Job</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Type', job.type], ['Total', job.total_rows], ['Imported', job.success_rows ?? 0], ['Errors', job.error_rows ?? 0]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <div className="text-lg font-extrabold text-brand">{v}</div><div className="text-xs text-gray-500">{k}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">Status: <span className="font-semibold">{job.status}</span></p>

      {errors.length > 0 ? (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Error rows ({errors.length})</h3>
            <a href={`/api/import/${id}/errors`} className="text-sm font-semibold text-brand hover:underline">⬇ Error report CSV</a>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-red-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Row</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Field</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Error</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {errors.map((e, i) => <tr key={i}><td className="px-3 py-2">{e.row}</td><td className="px-3 py-2">{e.field}</td><td className="px-3 py-2 text-red-700">{e.error_message}</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <p className="font-semibold">Fix and reimport</p>
            <p>Download the error report, correct the listed rows in your CSV, then upload again. Rows that already imported (matching slug) are skipped automatically, so re-uploading the full corrected file is safe.</p>
          </div>
        </section>
      ) : (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">No errors — all rows processed.</p>
      )}
    </div>
  );
}
