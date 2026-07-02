'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { upsertCandidateProfile, saveJob, unsaveJob } from '@/lib/candidate';
import { withdrawApplication } from '@/lib/applications';

function locale(fd) { return fd.get('locale') === 'en' ? 'en' : 'ml'; }

export async function saveProfileAction(fd) {
  await upsertCandidateProfile({
    role_category: fd.get('role_category'), district_id: fd.get('district_id') || null,
    experience_years: fd.get('experience_years'), headline: fd.get('headline'),
    summary: fd.get('summary'), resume_url: fd.get('resume_url'), linkedin_url: fd.get('linkedin_url'),
    is_open_to_work: fd.get('is_open_to_work') === 'on'
  });
  redirect(`/${locale(fd)}/candidate`);
}

export async function saveJobAction(fd) {
  await saveJob(fd.get('job_id'));
  revalidatePath(`/${locale(fd)}/candidate/saved`);
}

export async function unsaveJobAction(fd) {
  await unsaveJob(fd.get('job_id'));
  revalidatePath(`/${locale(fd)}/candidate/saved`);
}

export async function withdrawAction(fd) {
  await withdrawApplication(fd.get('app_id'));
  revalidatePath(`/${locale(fd)}/candidate/applications`);
}
