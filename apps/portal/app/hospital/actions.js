'use server';

// Server actions for hospital profile management. Writes go through lib/hospital,
// which repopulates the search vectors in the same transaction.

import { revalidatePath } from 'next/cache';
import {
  currentHospitalId, updateHospital,
  addDepartment, addService, addAccreditation
} from '@/lib/hospital';

function toIntOrNull(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function toNumOrNull(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export async function saveHospitalAction(formData) {
  const id = currentHospitalId();
  await updateHospital(id, {
    about_ml: formData.get('about_ml'),
    about_en: formData.get('about_en'),
    logo_url: formData.get('logo_url'),
    bed_count: toIntOrNull(formData.get('bed_count')),
    emergency_24x7: formData.get('emergency_24x7') === 'on',
    address_ml: formData.get('address_ml'),
    address_en: formData.get('address_en'),
    latitude: toNumOrNull(formData.get('latitude')),
    longitude: toNumOrNull(formData.get('longitude'))
  });
  revalidatePath('/hospital');
}

export async function addDepartmentAction(formData) {
  await addDepartment(currentHospitalId(), {
    name_ml: formData.get('name_ml'),
    name_en: formData.get('name_en')
  });
  revalidatePath('/hospital');
}

export async function addServiceAction(formData) {
  await addService(currentHospitalId(), {
    name_ml: formData.get('name_ml'),
    name_en: formData.get('name_en'),
    available_24x7: formData.get('available_24x7') === 'on'
  });
  revalidatePath('/hospital');
}

export async function addAccreditationAction(formData) {
  await addAccreditation(currentHospitalId(), {
    body: formData.get('body'),
    accreditation_no: formData.get('accreditation_no'),
    valid_until: formData.get('valid_until') || null
  });
  revalidatePath('/hospital');
}
