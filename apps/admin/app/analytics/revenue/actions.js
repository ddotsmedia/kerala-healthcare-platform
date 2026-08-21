'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminRole } from '@/lib/auth';
import { recordRevenue, deleteRevenue } from '@/lib/revenueAnalytics';

export async function addRevenueAction(formData) {
  if (!(await requireAdminRole())) return;
  await recordRevenue({
    type: formData.get('type'), amountInr: formData.get('amount_inr'),
    entityType: formData.get('entity_type'), notes: formData.get('notes')
  });
  revalidatePath('/analytics/revenue');
}

export async function deleteRevenueAction(formData) {
  if (!(await requireAdminRole())) return;
  await deleteRevenue(String(formData.get('id') || ''));
  revalidatePath('/analytics/revenue');
}
