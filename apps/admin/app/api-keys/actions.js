'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminRole } from '@/lib/auth';
import { createKey, revokeKey, reactivateKey } from '@/lib/apiKeys';

export async function createKeyAction(formData) {
  if (!(await requireAdminRole())) return;
  const res = await createKey({
    name: formData.get('name'), partnerName: formData.get('partner_name'),
    partnerType: formData.get('partner_type'), rateLimit: formData.get('rate_limit'),
    allowedEndpoints: formData.get('allowed_endpoints')
  });
  if (res.error) redirect(`/api-keys?error=${res.error}`);
  // Plaintext key is shown once. Admin-only surface; copy immediately.
  redirect(`/api-keys?created=${encodeURIComponent(res.key)}`);
}

export async function revokeKeyAction(formData) {
  if (!(await requireAdminRole())) return;
  await revokeKey(String(formData.get('id') || ''));
  revalidatePath('/api-keys');
}

export async function reactivateKeyAction(formData) {
  if (!(await requireAdminRole())) return;
  await reactivateKey(String(formData.get('id') || ''));
  revalidatePath('/api-keys');
}
