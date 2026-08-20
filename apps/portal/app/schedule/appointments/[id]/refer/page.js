// Refer to Specialist — search a specialist and write a referral for the
// patient on this appointment.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { getAppointment } from '@/lib/prescribe';
import { searchSpecialists } from '@/lib/referrals';
import { createReferralAction } from '../../../../referrals/actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Refer to specialist · KHP Portal' };

export default async function ReferPage(props) {
  const params = await props.params;
  const sp = (await props.searchParams) || {};
  const providerId = await currentDoctorId();
  const appt = providerId ? await getAppointment(providerId, params.id) : null;
  if (!appt) notFound();

  const q = sp.q ? String(sp.q) : '';
  const results = q ? await searchSpecialists(q, providerId) : [];

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500"><Link href="/schedule" className="hover:text-brand">Schedule</Link> › Refer to specialist</nav>
      <h2 className="text-lg font-bold text-gray-900">Refer to specialist</h2>
      {sp.error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Could not refer: {sp.error}</div> : null}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
        <p className="font-semibold text-gray-800">Patient: {appt.patient_name || 'Patient'}</p>
      </div>

      <form method="get" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search specialist by name or specialty…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Search</button>
      </form>

      {q && results.length === 0 ? <EmptyState message="No specialists found." /> : null}

      {results.length > 0 && (
        <form action={createReferralAction} className="space-y-4">
          <input type="hidden" name="appointmentId" value={appt.id} />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Select specialist</p>
            {results.map((d) => (
              <label key={d.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm">
                <input type="radio" name="referredToId" value={d.id} required />
                <span className="font-medium">{d.display_name}</span>
                <span className="text-xs text-gray-500">{d.specialty || ''}{d.district ? ` · ${d.district}` : ''}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Reason for referral</label>
            <textarea name="reason" required rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Clinical summary</label>
            <textarea name="clinicalSummary" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Urgency</label>
            <select name="urgency" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="routine">Routine</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <button className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-white">Send referral</button>
        </form>
      )}
    </div>
  );
}
