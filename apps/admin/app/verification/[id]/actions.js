'use server';

// Server action: record a verification decision, then return to the queue.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { recordDecision } from '@/lib/verification';
import { getSession } from '@/lib/session';
import { requireAdminRole } from '@/lib/auth';

/**
 * @param {FormData} formData
 */
export async function decideAction(formData) {
  if (!(await requireAdminRole())) redirect('/login');
  const session = (await getSession());
  const nmcMatchRaw = formData.get('nmc_match');
  const nmcMatch = nmcMatchRaw === 'yes' ? true : nmcMatchRaw === 'no' ? false : null;

  await recordDecision({
    id: formData.get('id'),
    providerType: formData.get('provider_type'),
    providerId: formData.get('provider_id'),
    status: formData.get('status'),
    nmcChecked: formData.get('nmc_checked') === 'on',
    nmcMatch,
    notes: formData.get('notes'),
    verifiedBy: session ? session.userId : null
  });

  revalidatePath('/verification');
  redirect('/verification');
}
