'use server';

// Doctor chat action — send a message to the patient.
import { revalidatePath } from 'next/cache';
import { sendDoctorMessage } from '@/lib/chat';

export async function sendAction(formData) {
  const id = formData.get('id');
  await sendDoctorMessage(id, formData.get('message'));
  revalidatePath(`/schedule/appointments/${id}/chat`);
}
