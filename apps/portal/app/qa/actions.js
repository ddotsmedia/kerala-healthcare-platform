'use server';

// Q&A actions — doctor posts an answer (enters moderation).
import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { createAnswer } from '@/lib/qa';

export async function answerAction(formData) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return;
  await createAnswer(doctorId, formData.get('question_id'), formData.get('body'));
  revalidatePath('/qa');
}
