// Verification queue list. Server component. Filter by status via ?status=.

import Link from 'next/link';
import { listQueue, STATUSES } from '@/lib/verification';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Verification queue · KHP Admin' };

export default async function VerificationQueue({ searchParams }) {
  const status = (searchParams && searchParams.status) || 'pending';
  const items = await listQueue(status);

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/verification?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              s === status ? 'bg-brand text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {s}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No items in “{status}”.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {items.map((it) => (
            <li key={it.id}>
              <Link href={`/verification/${it.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div>
                  <p className="font-medium">{it.provider_name || '(unnamed)'}</p>
                  <p className="text-xs text-gray-500">
                    {it.provider_type}
                    {it.provider_type === 'doctor' && it.nmc_registration_no
                      ? ` · NMC ${it.nmc_registration_no}`
                      : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{it.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
