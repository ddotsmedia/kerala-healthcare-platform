// Doctor profile management page. Shows verification/listing status (read-only)
// and an editable profile form. Saving repopulates search vectors.

import {
  VerificationStatusBadge,
  ListingStatusBadge,
  ProfileField,
  FormRow,
  LanguagePills,
  EmptyState
} from '@khp/ui';
import { redirect } from 'next/navigation';
import { currentDoctorId, getMyProfile } from '@/lib/profile';
import { saveProfileAction, addEducationAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My profile · KHP Portal' };

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none';

export default async function ProfilePage() {
  const id = (await currentDoctorId());
  if (!id) redirect('/login');
  const doctor = await getMyProfile(id);
  if (!doctor) redirect('/login');

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{doctor.display_name}</h2>
          <div className="flex gap-2">
            <VerificationStatusBadge status={doctor.verification_status} />
            <ListingStatusBadge status={doctor.listing_status} />
          </div>
        </div>
        <ProfileField label="Specialty" value={doctor.specialty_en || '—'} />
        <ProfileField label="District" value={doctor.district_en || '—'} />
        <ProfileField label="NMC registration" value={doctor.nmc_registration_no || '—'} />
        <ProfileField label="Languages">
          <LanguagePills languages={doctor.languages} />
        </ProfileField>
        <p className="mt-3 text-xs text-gray-500">
          Verification and publishing are handled by the verification team — they cannot be self-set.
        </p>
      </section>

      <form action={saveProfileAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">Edit profile</h3>
        <fieldset className="space-y-3 rounded-lg bg-amber-50 p-3">
          <legend className="px-1 text-xs font-medium text-amber-800">
            Key fields — editing name or registration resets verification to “pending” and unpublishes until re-verified
          </legend>
          <FormRow label="Name (English)" htmlFor="name_en">
            <input id="name_en" name="name_en" defaultValue={doctor.name_en || doctor.display_name || ''} className={inputCls} />
          </FormRow>
          <FormRow label="Name (Malayalam)" htmlFor="name_ml">
            <input id="name_ml" name="name_ml" defaultValue={doctor.name_ml || ''} className={inputCls} />
          </FormRow>
          <FormRow label="NMC registration number" htmlFor="registration_number">
            <input id="registration_number" name="registration_number" defaultValue={doctor.nmc_registration_no || ''} className={inputCls} />
          </FormRow>
        </fieldset>
        <FormRow label="About (Malayalam)" htmlFor="about_ml">
          <textarea id="about_ml" name="about_ml" rows={3} defaultValue={doctor.about_ml || ''} className={inputCls} />
        </FormRow>
        <FormRow label="About (English)" htmlFor="about_en">
          <textarea id="about_en" name="about_en" rows={3} defaultValue={doctor.about_en || ''} className={inputCls} />
        </FormRow>
        <FormRow label="Photo URL" htmlFor="photo_url">
          <input id="photo_url" name="photo_url" type="url" defaultValue={doctor.photo_url || ''} className={inputCls} />
        </FormRow>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Years experience" htmlFor="years_experience">
            <input id="years_experience" name="years_experience" type="number" min="0" defaultValue={doctor.years_experience ?? ''} className={inputCls} />
          </FormRow>
          <FormRow label="Consultation fee (₹)" htmlFor="consultation_fee">
            <input id="consultation_fee" name="consultation_fee" type="number" min="0" step="0.01" defaultValue={doctor.consultation_fee ?? ''} className={inputCls} />
          </FormRow>
        </div>
        <FormRow label="Languages" htmlFor="languages" hint="comma-separated codes, e.g. ml, en">
          <input id="languages" name="languages" defaultValue={(doctor.languages || ['ml']).join(', ')} className={inputCls} />
        </FormRow>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Save profile
        </button>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Education</h3>
        {doctor.education && doctor.education.length > 0 ? (
          <ul className="mb-4 space-y-1 text-sm text-gray-700">
            {doctor.education.map((e) => (
              <li key={e.id}>
                {e.degree}
                {(e.institution_en || e.institution_ml) ? ` — ${e.institution_en || e.institution_ml}` : ''}
                {e.year_completed ? ` (${e.year_completed})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No education entries yet." />
        )}
        <form action={addEducationAction} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input name="degree" placeholder="Degree" required className={inputCls} />
          <input name="institution_en" placeholder="Institution" className={inputCls} />
          <input name="year_completed" type="number" placeholder="Year" className={inputCls} />
          <button type="submit" className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
