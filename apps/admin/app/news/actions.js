'use server';

// Health-news admin actions — create, update, publish toggle, bulk paste.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { createNews, updateNews, togglePublish, bulkCreate } from '@/lib/news';

async function guard() { return requireAdminRole(); }
const fields = (f) => ({
  title_ml: f.get('title_ml'), title_en: f.get('title_en'),
  summary_ml: f.get('summary_ml'), summary_en: f.get('summary_en'),
  body_ml: f.get('body_ml'), body_en: f.get('body_en'),
  source: f.get('source'), source_url: f.get('source_url'),
  category: f.get('category'), district_id: f.get('district_id') || null,
  importance: f.get('importance'), image_url: f.get('image_url')
});

export async function createAction(formData) {
  if (!(await guard())) redirect('/login');
  await createNews(fields(formData));
  revalidatePath('/news');
}

export async function updateAction(formData) {
  if (!(await guard())) redirect('/login');
  await updateNews(formData.get('id'), fields(formData));
  revalidatePath('/news');
}

export async function publishAction(formData) {
  if (!(await guard())) redirect('/login');
  await togglePublish(formData.get('id'), formData.get('publish') === '1');
  revalidatePath('/news');
}

export async function bulkAction(formData) {
  if (!(await guard())) redirect('/login');
  await bulkCreate(formData.get('paste'), { source: formData.get('source'), category: formData.get('category') });
  revalidatePath('/news');
}
