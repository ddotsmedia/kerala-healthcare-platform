'use server';

// Server action: record a verification decision, then return to the queue.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { recordDecision } from '@/lib/verification';

/**
 * @param {FormData} formData
 */
export async function decideAction(formData) {
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
    // verifiedBy comes from the authenticated agent session (Phase 2 auth). Null for now.
    verifiedBy: null
  });

  revalidatePath('/verification');
  redirect('/verification');
}
