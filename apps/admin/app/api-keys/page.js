// Admin — partner API keys: issue, revoke, usage.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { listKeys, PARTNER_TYPES } from '@/lib/apiKeys';
import { createKeyAction, revokeKeyAction, reactivateKeyAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'API keys · KHP Admin' };

const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 16).replace('T', ' ') : '—');
const ENDPOINTS = ['doctors', 'hospitals', 'specialties', 'districts', 'health-data'];

export default async function ApiKeysPage(props) {
  if (!(await requireAdminRole())) redirect('/login');
  const sp = (await props.searchParams) || {};
  const keys = await listKeys();

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Partner API keys</h2>

      {sp.created ? (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">✓ Key created — copy it now, it will not be shown again:</p>
          <code className="mt-2 block break-all rounded bg-white px-3 py-2 font-mono text-sm text-gray-900">{sp.created}</code>
        </div>
      ) : null}
      {sp.error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div> : null}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Issue a key</h3>
        <form action={createKeyAction} className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <input name="name" required placeholder="Key name (e.g. Star Health prod)" className={inp} />
          <input name="partner_name" required placeholder="Partner name" className={inp} />
          <select name="partner_type" className={inp}>{PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <input name="rate_limit" type="number" min="1" defaultValue={1000} placeholder="Rate limit / hour" className={inp} />
          <input name="allowed_endpoints" placeholder={`allowed endpoints (comma-sep, blank = all): ${ENDPOINTS.join(', ')}`} className={`${inp} sm:col-span-2`} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Create key</button>
        </form>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Keys ({keys.length})</h3>
        {keys.length === 0 ? <p className="text-sm text-gray-400">No API keys issued.</p> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Name / Partner</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Prefix</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Limit/hr</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Requests</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Last used</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-3 py-2" />
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className="px-3 py-2 font-medium">{k.name}<span className="block text-xs text-gray-400">{k.partner_name}</span></td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{k.key_prefix}…</td>
                    <td className="px-3 py-2">{k.partner_type}</td>
                    <td className="px-3 py-2 text-right">{k.rate_limit_per_hour}</td>
                    <td className="px-3 py-2 text-right">{String(k.request_count)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{fmt(k.last_used_at)}</td>
                    <td className="px-3 py-2">{k.is_active ? <span className="text-green-600">active</span> : <span className="text-gray-400">revoked</span>}</td>
                    <td className="px-3 py-2 text-right">
                      {k.is_active
                        ? <form action={revokeKeyAction}><input type="hidden" name="id" value={k.id} /><button className="text-xs font-semibold text-red-500 hover:underline">Revoke</button></form>
                        : <form action={reactivateKeyAction}><input type="hidden" name="id" value={k.id} /><button className="text-xs font-semibold text-brand hover:underline">Reactivate</button></form>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
