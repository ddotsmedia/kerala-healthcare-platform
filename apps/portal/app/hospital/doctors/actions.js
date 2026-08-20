'use server';

// Server actions for managing hospital doctor affiliations.
import { revalidatePath } from 'next/cache';
import { currentHospitalId } from '@/lib/hospital';
import { addDoctorByReg, removeAffiliation } from '@/lib/hospitalPortal';

export async function addDoctorAction(formData) {
  const id = await currentHospitalId();
  if (!id) return;
  await addDoctorByReg(id, formData.get('registration_number'));
  revalidatePath('/hospital/doctors');
}

export async function removeDoctorAction(formData) {
  const id = await currentHospitalId();
  if (!id) return;
  await removeAffiliation(id, formData.get('affiliation_id'));
  revalidatePath('/hospital/doctors');
}
