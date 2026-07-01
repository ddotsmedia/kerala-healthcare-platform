'use server';

// Availability management actions (templates + overrides).

import { revalidatePath } from 'next/cache';
import { currentDoctorId } from '@/lib/profile';
import {
  addTemplate, removeTemplate, addOverride, removeOverride
} from '@/lib/availability';

function toInt(v, d) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; }

export async function addTemplateAction(formData) {
  await addTemplate((await currentDoctorId()), {
    day_of_week: toInt(formData.get('day_of_week'), 1),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    slot_duration_minutes: toInt(formData.get('slot_duration_minutes'), 30),
    consultation_mode: formData.get('consultation_mode') || 'in_person'
  });
  revalidatePath('/schedule/availability');
}

export async function removeTemplateAction(formData) {
  await removeTemplate((await currentDoctorId()), formData.get('id'));
  revalidatePath('/schedule/availability');
}

export async function addOverrideAction(formData) {
  await addOverride((await currentDoctorId()), {
    override_date: formData.get('override_date'),
    is_blocked: formData.get('is_blocked') === 'on',
    start_time: formData.get('start_time') || null,
    end_time: formData.get('end_time') || null,
    reason: formData.get('reason')
  });
  revalidatePath('/schedule/availability');
}

export async function removeOverrideAction(formData) {
  await removeOverride((await currentDoctorId()), formData.get('id'));
  revalidatePath('/schedule/availability');
}
