'use server';

// Second-opinion admin actions — match a request to a doctor.
import { revalidatePath } from 'next/cache';
import { requireAdminRole } from '@/lib/auth';
import { matchRequest } from '@/lib/secondOpinion';

export async function matchAction(formData) {
  if (!(await requireAdminRole())) return;
  const requestId = formData.get('requestId');
  const doctorId = formData.get('doctorId');
  if (requestId && doctorId) await matchRequest(requestId, doctorId);
  revalidatePath('/second-opinion');
}
