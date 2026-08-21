'use server';

// Book a slot, then redirect to the new appointment's detail page.

import { redirect } from 'next/navigation';
import { bookSlot } from '@khp/appointments';
import { currentPatientId } from '@/lib/appointments';
import { onAppointmentBooked } from '@/lib/appointmentNotify';
import { recordEvent } from '@/lib/analytics';

export async function bookAction(formData) {
  const locale = formData.get('locale') || 'ml';
  const pid = await currentPatientId();
  if (!pid) redirect(`/${locale}/login`);
  const providerId = formData.get('providerId');
  recordEvent({ eventType: 'booking_started', entityType: 'doctor', entityId: providerId });
  const result = await bookSlot(
    providerId, pid, formData.get('slotDate'),
    formData.get('slotStart'), formData.get('mode'), undefined, formData.get('familyMemberId') || null
  );
  if (!result.ok) redirect(`/${locale}/book/${formData.get('doctorSlug')}?error=${result.error}`);
  recordEvent({ eventType: 'booking_completed', entityType: 'doctor', entityId: providerId });
  await onAppointmentBooked(result.appointment.id);
  redirect(`/${locale}/patient/appointments/${result.appointment.id}`);
}
