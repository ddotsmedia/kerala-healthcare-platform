'use server';

// Doctor schedule actions: mark complete, cancel.

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { completeAppointment, cancelByDoctor } from '@/lib/schedule';
import { notifyAppointmentEvent } from '@khp/notifications';

export async function completeAction(formData) {
  const providerId = currentDoctorId();
  await completeAppointment(providerId, formData.get('id'));
  revalidatePath('/schedule');
}

export async function cancelAction(formData) {
  const providerId = currentDoctorId();
  const id = formData.get('id');
  const r = await cancelByDoctor(providerId, id, formData.get('reason'));
  if (r.ok) { try { await notifyAppointmentEvent('cancelled', id, { byRole: 'doctor' }); } catch (e) { console.error(e.message); } }
  revalidatePath('/schedule');
}
