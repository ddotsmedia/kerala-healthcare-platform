'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { createDraft, updateDraft, submit, approve, publish, reject, archive } from '@/lib/cms';

async function need() {
  const s = (await getSession());
  if (!s) redirect('/login');
  return s;
}

export async function createAction(formData) {
  const s = await need();
  const r = await createDraft(s, {
    slug: formData.get('slug'), type: formData.get('type') || 'article',
    title_en: formData.get('title_en'), title_ml: formData.get('title_ml'),
    body_en: formData.get('body_en'), body_ml: formData.get('body_ml')
  });
  if (r.ok) redirect(`/cms/${r.item.id}`);
  redirect(`/cms?error=${r.error}`);
}

export async function updateAction(formData) {
  const s = await need();
  await updateDraft(s, formData.get('id'), {
    title_en: formData.get('title_en'), title_ml: formData.get('title_ml'),
    body_en: formData.get('body_en'), body_ml: formData.get('body_ml'),
    excerpt_en: formData.get('excerpt_en'), excerpt_ml: formData.get('excerpt_ml')
  });
  revalidatePath(`/cms/${formData.get('id')}`);
}

async function move(fn, formData) {
  const s = await need();
  await fn(s, formData.get('id'));
  revalidatePath(`/cms/${formData.get('id')}`);
  revalidatePath('/cms');
}
export const submitAction = async (fd) => move(submit, fd);
export const approveAction = async (fd) => move(approve, fd);
export const publishAction = async (fd) => move(publish, fd);
export const rejectAction = async (fd) => move(reject, fd);
export const archiveAction = async (fd) => move(archive, fd);
