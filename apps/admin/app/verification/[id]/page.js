// Verification detail + decision form. Server component; submits a server action.
// NMC check is MANUAL: the agent looks up the registration number on the NMC
// public portal, then records the result here.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getItem, STATUSES } from '@/lib/verification';
import { decideAction } from './actions';

export const dynamic = 'force-dynamic';

const NMC_PORTAL = 'https://www.nmc.org.in/information-desk/indian-medical-register/';

export default async function VerificationDetail({ params }) {
  const item = await getItem(params.id);
  if (!item) notFound();

  const isDoctor = item.provider_type === 'doctor';

  return (
    <div className="space-y-5">
      <Link href="/verification" className="text-sm text-brand">← Back to queue</Link>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold">{item.provider_name || '(unnamed)'}</h2>
        <p className="mt-1 text-xs text-gray-500">
          {item.provider_type} · current status: {item.status}
        </p>
        {isDoctor && (
          <p className="mt-2 text-sm">
            NMC registration: <span className="font-mono">{item.nmc_registration_no || '—'}</span>
            {' · '}
            <a href={NMC_PORTAL} target="_blank" rel="noopener noreferrer" className="text-brand underline">
              open NMC register
            </a>
          </p>
        )}
      </div>

      <form action={decideAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="provider_type" value={item.provider_type} />
        <input type="hidden" name="provider_id" value={item.provider_id} />

        <label className="block">
          <span className="text-sm font-medium">Decision</span>
          <select name="status" defaultValue={item.status} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {isDoctor && (
          <fieldset className="space-y-2 rounded-lg bg-gray-50 p-3">
            <legend className="text-sm font-medium">NMC manual cross-check</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="nmc_checked" defaultChecked={item.nmc_checked} />
              Registration number checked on NMC portal
            </label>
            <label className="block text-sm">
              Match result
              <select name="nmc_match" defaultValue="" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                <option value="">unknown</option>
                <option value="yes">matches</option>
                <option value="no">does not match</option>
              </select>
            </label>
          </fieldset>
        )}

        <label className="block">
          <span className="text-sm font-medium">Notes / evidence reference</span>
          <textarea name="notes" rows={3} defaultValue={item.notes || ''} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>

        <button type="submit" className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
          Save decision
        </button>
      </form>
    </div>
  );
}
