'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@khp/notifications';
import { currentDoctorId } from '@/lib/profile';
import { createReferral, updateOutcome } from '@/lib/referrals';

export async function createReferralAction(formData) {
  const referringId = await currentDoctorId();
  if (!referringId) return;
  const appointmentId = formData.get('appointmentId') || null;
  const res = await createReferral(referringId, {
    referredToId: formData.get('referredToId'),
    patientId: formData.get('patientId') || null,
    appointmentId,
    reason: formData.get('reason'),
    clinicalSummary: formData.get('clinicalSummary'),
    urgency: formData.get('urgency')
  });
  if (res.error) {
    const base = appointmentId ? `/schedule/appointments/${appointmentId}/refer` : '/referrals';
    redirect(`${base}?error=${res.error}`);
  }
  try {
    await sendEmail(process.env.DEMO_NOTIFY_TO || null,
      'You have been referred to a specialist',
      'Your doctor has referred you to a specialist. Log in to MalayaliDoctor to book an appointment.');
  } catch { /* non-blocking */ }
  redirect('/referrals?sent=1');
}

export async function updateOutcomeAction(formData) {
  const referredToId = await currentDoctorId();
  if (!referredToId) return;
  await updateOutcome(referredToId, String(formData.get('id') || ''), {
    status: formData.get('status'),
    outcome: formData.get('outcome')
  });
  revalidatePath('/referrals');
}
