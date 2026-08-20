// Bulk Provider Import — admin page. Upload doctor/hospital CSV, preview, import.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { listJobs } from '@/lib/importJobs';
import ImportClient from './ImportClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bulk Import · KHP Admin' };

export default async function ImportPage() {
  if (!(await requireAdminRole())) redirect('/login');
  const jobs = await listJobs(10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Bulk Provider Import</h2>
        <p className="text-sm text-gray-500">Import doctors or hospitals from a CSV. Imported providers start as unverified drafts and must be verified before publishing.</p>
      </div>

      <ImportClient />

      {jobs.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Recent imports</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">File</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Rows</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">OK / Err</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-3 py-2"><a href={`/import/${j.id}`} className="text-brand hover:underline">{j.filename || j.id.slice(0, 8)}</a></td>
                    <td className="px-3 py-2">{j.type}</td>
                    <td className="px-3 py-2">{j.total_rows}</td>
                    <td className="px-3 py-2">{j.success_rows ?? 0} / {j.error_rows ?? 0}</td>
                    <td className="px-3 py-2">{j.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
