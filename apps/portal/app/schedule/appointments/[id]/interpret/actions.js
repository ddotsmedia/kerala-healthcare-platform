'use server';

import { redirect } from 'next/navigation';
import { sendEmail } from '@khp/notifications';
import { currentDoctorId } from '@/lib/profile';
import { addInterpretation } from '@/lib/labInterpret';

export async function addInterpretationAction(formData) {
  const providerId = await currentDoctorId();
  if (!providerId) return;
  const appointmentId = String(formData.get('appointmentId') || '');

  const res = await addInterpretation(providerId, appointmentId, {
    labReportId: formData.get('labReportId') || null,
    interpretation: formData.get('interpretation'),
    recommendations: formData.get('recommendations'),
    nextTestDate: formData.get('nextTestDate') || null,
    urgency: formData.get('urgency'),
    isShared: formData.get('isShared') === 'true'
  });
  if (res.error) redirect(`/schedule/appointments/${appointmentId}/interpret?error=${res.error}`);

  try {
    await sendEmail(process.env.DEMO_NOTIFY_TO || null,
      'Your doctor shared a lab interpretation',
      'Your doctor has added an interpretation to one of your lab reports. View it in your MalayaliDoctor health records.');
  } catch { /* non-blocking */ }

  redirect(`/schedule/appointments/${appointmentId}/interpret?saved=${res.id}`);
}
