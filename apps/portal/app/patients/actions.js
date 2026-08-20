'use server';

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { addNote, createFollowUp, updateFollowUp } from '@/lib/patients';

export async function addNoteAction(formData) {
  const providerId = await currentDoctorId();
  if (!providerId) return;
  const patientId = String(formData.get('patientId') || '');
  await addNote(providerId, patientId, {
    note: formData.get('note'),
    noteType: formData.get('noteType'),
    isPrivate: formData.get('isPrivate') !== 'false',
    appointmentId: formData.get('appointmentId') || null
  });
  revalidatePath(`/patients/${patientId}`);
}

export async function createFollowUpAction(formData) {
  const providerId = await currentDoctorId();
  if (!providerId) return;
  const patientId = String(formData.get('patientId') || '');
  await createFollowUp(providerId, patientId, {
    dueDate: formData.get('dueDate'),
    reason: formData.get('reason')
  });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath('/follow-ups');
}

export async function updateFollowUpAction(formData) {
  const providerId = await currentDoctorId();
  if (!providerId) return;
  await updateFollowUp(providerId, String(formData.get('id') || ''), String(formData.get('status') || ''));
  revalidatePath('/follow-ups');
}
