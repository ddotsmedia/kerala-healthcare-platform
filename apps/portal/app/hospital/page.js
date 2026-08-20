// Hospital admin home — overview stats + quick links.

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentHospitalId, getMyHospital } from '@/lib/hospital';
import { homeStats } from '@/lib/hospitalPortal';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hospital · KHP Portal' };

function Stat({ n, label }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <div className="text-2xl font-extrabold text-brand">{n}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function HospitalHome() {
  const id = await currentHospitalId();
  const [hospital, stats] = await Promise.all([getMyHospital(id), homeStats(id)]);
  if (!hospital) return <EmptyState message="No hospital linked to your account. Ask an admin to add you, or set PORTAL_DEMO_HOSPITAL_ID." />;

  const links = [
    ['/hospital/profile', '🏥 Edit profile, departments & services'],
    ['/hospital/doctors', '👨‍⚕️ Manage affiliated doctors'],
    ['/hospital/appointments', "📅 Today's appointments"],
    ['/hospital/analytics', '📊 Analytics']
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{hospital.name_en || hospital.name_ml}</h2>
        <p className="text-sm text-gray-500">{hospital.district_en || ''} · {hospital.verification_status} / {hospital.listing_status}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat n={stats?.today_appointments ?? 0} label="Today's appointments" />
        <Stat n={stats?.doctors ?? 0} label="Affiliated doctors" />
        <Stat n={stats?.departments ?? 0} label="Departments" />
        <Stat n={stats?.services ?? 0} label="Services" />
      </div>

      <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-800 hover:border-brand hover:text-brand">{label}</Link>
        ))}
      </nav>

      {hospital.verification_status !== 'verified' && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Your hospital is not yet verified/published. Complete your profile and the verification team will review it.
        </p>
      )}
    </div>
  );
}
