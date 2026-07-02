'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createEmployerProfile, createJob, updateJob, setJobStatus } from '@/lib/employer';
import { updateApplicationStatus } from '@/lib/applications';

function locale(fd) { return fd.get('locale') === 'en' ? 'en' : 'ml'; }

export async function createProfileAction(fd) {
  await createEmployerProfile({
    org_name: fd.get('org_name'), org_type: fd.get('org_type'),
    district_id: fd.get('district_id') || null, description: fd.get('description'), website: fd.get('website')
  });
  redirect(`/${locale(fd)}/employer`);
}

export async function createJobAction(fd) {
  const r = await createJob({
    title: fd.get('title'), role_category: fd.get('role_category'),
    description: fd.get('description'), requirements: fd.get('requirements'),
    district_id: fd.get('district_id') || null, employment_type: fd.get('employment_type'),
    experience_years_min: fd.get('experience_years_min')
  });
  if (r.ok) redirect(`/${locale(fd)}/employer/listings/${r.job.id}`);
  redirect(`/${locale(fd)}/employer/listings/new?error=${r.error}`);
}

export async function updateJobAction(fd) {
  await updateJob(fd.get('id'), {
    title: fd.get('title'), role_category: fd.get('role_category'),
    description: fd.get('description'), requirements: fd.get('requirements'),
    employment_type: fd.get('employment_type')
  });
  revalidatePath(`/${locale(fd)}/employer/listings/${fd.get('id')}`);
}

export async function closeJobAction(fd) {
  await setJobStatus(fd.get('id'), 'closed');
  revalidatePath(`/${locale(fd)}/employer/listings`);
}

export async function reopenJobAction(fd) {
  await setJobStatus(fd.get('id'), 'active');
  revalidatePath(`/${locale(fd)}/employer/listings`);
}

export async function setAppStatusAction(fd) {
  await updateApplicationStatus(fd.get('app_id'), fd.get('status'), fd.get('notes'));
  revalidatePath(`/${locale(fd)}/employer/listings/${fd.get('job_id')}/applications`);
}
