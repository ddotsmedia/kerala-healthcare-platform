'use server';

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { addCredit, deleteCredit } from '@/lib/cme';

export async function addCreditAction(formData) {
  const id = await currentDoctorId();
  if (!id) return;
  await addCredit(id, {
    title: formData.get('title'), organiser: formData.get('organiser'), date: formData.get('date'),
    credits: formData.get('credits'), category: formData.get('category'), certificateUrl: formData.get('certificateUrl')
  });
  revalidatePath('/cme');
}

export async function deleteCreditAction(formData) {
  const id = await currentDoctorId();
  if (!id) return;
  await deleteCredit(id, String(formData.get('id') || ''));
  revalidatePath('/cme');
}
