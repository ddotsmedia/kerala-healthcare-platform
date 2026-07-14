'use server';

// Q&A moderation actions — approve/reject questions & answers, accept an answer.
import { revalidatePath } from 'next/cache';
import { requireAdminRole } from '@/lib/auth';
import { getSession } from '@/lib/session';
import {
  approveQuestion, rejectQuestion, approveAnswer, rejectAnswer, acceptAnswer
} from '@/lib/qa';

async function guard() {
  if (!(await requireAdminRole())) return null;
  const s = await getSession();
  return s ? s.userId : null;
}

export async function moderateAction(formData) {
  const adminId = await guard();
  if (adminId === null) return;
  const kind = formData.get('kind');   // question | answer
  const action = formData.get('action'); // approve | reject | accept
  const id = formData.get('id');
  const reason = formData.get('reason');
  if (kind === 'question') {
    if (action === 'approve') await approveQuestion(id, adminId);
    else if (action === 'reject') await rejectQuestion(id, adminId, reason);
  } else if (kind === 'answer') {
    if (action === 'approve') await approveAnswer(id, adminId);
    else if (action === 'reject') await rejectAnswer(id, adminId, reason);
    else if (action === 'accept') await acceptAnswer(id, adminId);
  }
  revalidatePath('/qa');
}
