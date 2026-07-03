// CMS edit page — textarea editor (no rich-text package) + workflow actions.

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getContent } from '@/lib/cms';
import { updateAction, submitAction, approveAction, publishAction, archiveAction } from '../actions';

export const dynamic = 'force-dynamic';
const ta = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

function Btn({ action, id, label, cls }) {
  return (
    <form action={action}><input type="hidden" name="id" value={id} />
      <button className={`rounded-lg px-3 py-1.5 text-xs font-medium ${cls}`}>{label}</button>
    </form>
  );
}

export default async function CmsEdit(props) {
  const params = await props.params;
  if (!(await requireAdminRole())) redirect('/login');
  const c = await getContent(params.id);
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/cms" className="text-sm text-brand">← Content</Link>
        <span className="text-xs text-gray-500">{c.type} · {c.status}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {c.status === 'draft' && <Btn action={submitAction} id={c.id} label="Submit for review" cls="bg-amber-500 text-white" />}
        {c.status === 'in_review' && <Link href={`/cms/${c.id}/review`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">Open review</Link>}
        {c.status === 'approved' && <Btn action={publishAction} id={c.id} label="Publish" cls="bg-brand text-white" />}
        {c.status !== 'archived' && <Btn action={archiveAction} id={c.id} label="Archive" cls="border border-gray-300 text-gray-600" />}
      </div>

      <form action={updateAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="hidden" name="id" value={c.id} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">Title (EN)<input name="title_en" defaultValue={c.title_en || ''} className={ta} /></label>
          <label className="text-sm">Title (ML)<input name="title_ml" defaultValue={c.title_ml || ''} className={ta} /></label>
        </div>
        <label className="block text-sm">Body (EN)
          <textarea name="body_en" rows={6} defaultValue={c.body_en || ''} className={ta} /></label>
        <label className="block text-sm">Body (ML)
          <textarea name="body_ml" rows={6} defaultValue={c.body_ml || ''} className={ta} /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">Excerpt (EN)<input name="excerpt_en" defaultValue={c.excerpt_en || ''} className={ta} /></label>
          <label className="text-sm">Excerpt (ML)<input name="excerpt_ml" defaultValue={c.excerpt_ml || ''} className={ta} /></label>
        </div>
        <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white">Save</button>
        <p className="text-xs text-gray-400">Formatting: use Markdown-style **bold**, *italic*, - lists, [links](url). No external editor package.</p>
      </form>
    </div>
  );
}
