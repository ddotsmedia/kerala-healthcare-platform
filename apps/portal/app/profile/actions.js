'use server';

// Server actions for doctor profile management. Writes go through lib/profile,
// which repopulates the search vectors in the same transaction.

import { revalidatePath } from 'next/cache';
import { currentDoctorId, updateProfile, addEducation } from '@/lib/profile';

function toIntOrNull(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function toNumOrNull(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function csvToArray(v) {
  if (!v) return ['ml'];
  const arr = String(v).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return arr.length ? arr : ['ml'];
}

export async function saveProfileAction(formData) {
  const id = (await currentDoctorId());
  await updateProfile(id, {
    about_ml: formData.get('about_ml'),
    about_en: formData.get('about_en'),
    photo_url: formData.get('photo_url'),
    years_experience: toIntOrNull(formData.get('years_experience')),
    consultation_fee: toNumOrNull(formData.get('consultation_fee')),
    languages: csvToArray(formData.get('languages')),
    name_en: formData.get('name_en') || null,
    name_ml: formData.get('name_ml') || null,
    registration_number: formData.get('registration_number') || null,
    whatsapp_number: (formData.get('whatsapp_number') || '').replace(/\D/g, '') || null
  });
  revalidatePath('/profile');
}

export async function addEducationAction(formData) {
  const id = (await currentDoctorId());
  await addEducation(id, {
    degree: formData.get('degree'),
    institution_ml: formData.get('institution_ml'),
    institution_en: formData.get('institution_en'),
    year_completed: toIntOrNull(formData.get('year_completed'))
  });
  revalidatePath('/profile');
}
