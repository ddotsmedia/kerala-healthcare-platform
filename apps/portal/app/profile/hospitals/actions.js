'use server';

// Server actions for doctor <-> hospital affiliation management.

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { addAffiliation, removeAffiliation } from '@/lib/affiliations';

export async function addAffiliationAction(formData) {
  await addAffiliation(currentDoctorId(), formData.get('hospital_id'), formData.get('role'));
  revalidatePath('/profile/hospitals');
}

export async function removeAffiliationAction(formData) {
  await removeAffiliation(currentDoctorId(), formData.get('affiliation_id'));
  revalidatePath('/profile/hospitals');
}
