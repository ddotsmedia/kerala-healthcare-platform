'use server';

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { addPublication, deletePublication, addAward, deleteAward } from '@/lib/publications';

export async function addPublicationAction(formData) {
  const id = await currentDoctorId();
  if (!id) return;
  await addPublication(id, {
    title: formData.get('title'), journal: formData.get('journal'), year: formData.get('year'),
    doi: formData.get('doi'), pubmedId: formData.get('pubmedId'), url: formData.get('url'), type: formData.get('type')
  });
  revalidatePath('/profile/publications');
}

export async function deletePublicationAction(formData) {
  const id = await currentDoctorId();
  if (!id) return;
  await deletePublication(id, String(formData.get('id') || ''));
  revalidatePath('/profile/publications');
}

export async function addAwardAction(formData) {
  const id = await currentDoctorId();
  if (!id) return;
  await addAward(id, {
    title: formData.get('title'), awardedBy: formData.get('awardedBy'),
    year: formData.get('year'), description: formData.get('description')
  });
  revalidatePath('/profile/publications');
}

export async function deleteAwardAction(formData) {
  const id = await currentDoctorId();
  if (!id) return;
  await deleteAward(id, String(formData.get('id') || ''));
  revalidatePath('/profile/publications');
}
