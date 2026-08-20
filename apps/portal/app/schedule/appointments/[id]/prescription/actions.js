'use server';

import { redirect } from 'next/navigation';
import { sendEmail } from '@khp/notifications';
import { currentDoctorId } from '@/lib/profile';
import { issuePrescription } from '@/lib/prescribe';

export async function issuePrescriptionAction(formData) {
  const providerId = await currentDoctorId();
  if (!providerId) return;
  const appointmentId = String(formData.get('appointmentId') || '');
  let medications = [];
  try { medications = JSON.parse(formData.get('medications') || '[]'); } catch { medications = []; }

  const res = await issuePrescription(providerId, appointmentId, {
    medications,
    instructions: formData.get('instructions'),
    nextVisit: formData.get('nextVisit') || null,
    signature: formData.get('signature')
  });
  if (res.error) redirect(`/schedule/appointments/${appointmentId}/prescription?error=${res.error}`);

  // Best-effort patient notification (encrypted contact not decryptable here — dev override).
  try {
    await sendEmail(process.env.DEMO_NOTIFY_TO || null,
      'New prescription available',
      'Your doctor has issued a digital prescription. View it in your MalayaliDoctor health records.');
  } catch { /* non-blocking */ }

  redirect(`/schedule/appointments/${appointmentId}/prescription?issued=${res.id}`);
}
