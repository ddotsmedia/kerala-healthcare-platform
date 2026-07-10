'use server';

// OPD schedule management actions (add / remove / toggle active).

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import { addOpd, removeOpd, updateOpd } from '@/lib/opd';

function toIntOrNull(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }

export async function addOpdAction(formData) {
  await addOpd((await currentDoctorId()), {
    hospital_id: formData.get('hospital_id'),
    day_of_week: formData.getAll('dow'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    consultation_type: formData.get('consultation_type') || 'outpatient',
    max_tokens: toIntOrNull(formData.get('max_tokens')),
    notes_en: formData.get('notes_en') || null
  });
  revalidatePath('/schedule/opd');
}

export async function removeOpdAction(formData) {
  await removeOpd((await currentDoctorId()), formData.get('id'));
  revalidatePath('/schedule/opd');
}

export async function toggleOpdAction(formData) {
  await updateOpd((await currentDoctorId()), formData.get('id'), { is_active: formData.get('is_active') === '1' });
  revalidatePath('/schedule/opd');
}
