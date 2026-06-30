'use server';

// Patient cancels their own appointment.

import { revalidatePath } from 'next/cache';
import { currentPatientId, cancelByPatient } from '@/lib/appointments';
import { onAppointmentCancelled } from '@/lib/appointmentNotify';

export async function cancelAppointmentAction(formData) {
  const pid = await currentPatientId();
  const id = formData.get('id');
  const result = await cancelByPatient(pid, id, formData.get('reason'));
  if (result.ok) await onAppointmentCancelled(id, 'patient');
  revalidatePath(`/`);
}
