'use server';

// Refill queue actions — approve / reject / dispatch.
import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { decideRefill } from '@/lib/refills';

export async function decideAction(formData) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return;
  await decideRefill(doctorId, formData.get('id'), formData.get('status'), formData.get('doctor_notes'));
  revalidatePath('/refills');
}
