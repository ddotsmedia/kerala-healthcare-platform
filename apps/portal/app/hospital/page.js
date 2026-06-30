// Hospital profile management page. Mirrors the doctor profile editor.
// Status fields are read-only; saving repopulates search vectors.

import {
  VerificationStatusBadge,
  ListingStatusBadge,
  ProfileField,
  FormRow,
  EmptyState
} from '@khp/ui';
import { currentHospitalId, getMyHospital } from '@/lib/hospital';
import {
  saveHospitalAction, addDepartmentAction, addServiceAction, addAccreditationAction
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hospital profile · KHP Portal' };

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none';

export default async function HospitalPage() {
  const hospital = await getMyHospital(currentHospitalId());

  if (!hospital) {
    return <EmptyState message="No hospital profile loaded. Set PORTAL_DEMO_HOSPITAL_ID (auth arrives in Phase 2)." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{hospital.name_en || hospital.name_ml}</h2>
          <div className="flex gap-2">
            <VerificationStatusBadge status={hospital.verification_status} />
            <ListingStatusBadge status={hospital.listing_status} />
          </div>
        </div>
        <ProfileField label="District" value={hospital.district_en || '—'} />
        <ProfileField label="Registration" value={hospital.registration_no || '—'} />
        <p className="mt-3 text-xs text-gray-500">
          Verification and publishing are handled by the verification team — they cannot be self-set.
        </p>
      </section>

      <form action={saveHospitalAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">Edit profile</h3>
        <FormRow label="About (Malayalam)" htmlFor="about_ml">
          <textarea id="about_ml" name="about_ml" rows={3} defaultValue={hospital.about_ml || ''} className={inputCls} />
        </FormRow>
        <FormRow label="About (English)" htmlFor="about_en">
          <textarea id="about_en" name="about_en" rows={3} defaultValue={hospital.about_en || ''} className={inputCls} />
        </FormRow>
        <FormRow label="Logo URL" htmlFor="logo_url">
          <input id="logo_url" name="logo_url" type="url" defaultValue={hospital.logo_url || ''} className={inputCls} />
        </FormRow>
        <FormRow label="Address (Malayalam)" htmlFor="address_ml">
          <input id="address_ml" name="address_ml" defaultValue={hospital.address_ml || ''} className={inputCls} />
        </FormRow>
        <FormRow label="Address (English)" htmlFor="address_en">
          <input id="address_en" name="address_en" defaultValue={hospital.address_en || ''} className={inputCls} />
        </FormRow>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Bed count" htmlFor="bed_count">
            <input id="bed_count" name="bed_count" type="number" min="0" defaultValue={hospital.bed_count ?? ''} className={inputCls} />
          </FormRow>
          <FormRow label="Emergency" htmlFor="emergency_24x7">
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input id="emergency_24x7" name="emergency_24x7" type="checkbox" defaultChecked={hospital.emergency_24x7} />
              24x7 emergency
            </label>
          </FormRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Latitude" htmlFor="latitude">
            <input id="latitude" name="latitude" type="number" step="0.000001" defaultValue={hospital.latitude ?? ''} className={inputCls} />
          </FormRow>
          <FormRow label="Longitude" htmlFor="longitude">
            <input id="longitude" name="longitude" type="number" step="0.000001" defaultValue={hospital.longitude ?? ''} className={inputCls} />
          </FormRow>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Save profile
        </button>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Departments</h3>
        {hospital.departments.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {hospital.departments.map((d) => (
              <span key={d.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs">{d.name_en || d.name_ml}</span>
            ))}
          </div>
        ) : <EmptyState message="No departments yet." />}
        <form action={addDepartmentAction} className="grid grid-cols-3 gap-2">
          <input name="name_en" placeholder="Name (EN)" required className={inputCls} />
          <input name="name_ml" placeholder="പേര് (ML)" className={inputCls} />
          <button type="submit" className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">Add</button>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Services</h3>
        {hospital.services.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {hospital.services.map((s) => (
              <span key={s.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs">{s.name_en || s.name_ml}</span>
            ))}
          </div>
        ) : <EmptyState message="No services yet." />}
        <form action={addServiceAction} className="grid grid-cols-3 gap-2">
          <input name="name_en" placeholder="Name (EN)" required className={inputCls} />
          <input name="name_ml" placeholder="പേര് (ML)" className={inputCls} />
          <button type="submit" className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">Add</button>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Accreditations</h3>
        {hospital.accreditations.length > 0 ? (
          <ul className="mb-3 space-y-1 text-sm text-gray-700">
            {hospital.accreditations.map((a) => (
              <li key={a.id}>{a.body}{a.accreditation_no ? ` — ${a.accreditation_no}` : ''}</li>
            ))}
          </ul>
        ) : <EmptyState message="No accreditations yet." />}
        <form action={addAccreditationAction} className="grid grid-cols-3 gap-2">
          <input name="body" placeholder="Body (e.g. NABH)" required className={inputCls} />
          <input name="accreditation_no" placeholder="Number" className={inputCls} />
          <button type="submit" className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">Add</button>
        </form>
        <p className="mt-2 text-xs text-gray-400">Added accreditations stay unverified until the verification team confirms them.</p>
      </section>
    </div>
  );
}
