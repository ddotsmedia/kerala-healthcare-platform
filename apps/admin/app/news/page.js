// Health-news admin — create item, list with publish toggle, bulk paste import.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { listNews, listDistricts, CATEGORIES, IMPORTANCE } from '@/lib/news';
import { createAction, publishAction, bulkAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Health News · KHP Admin' };

const STATUSES = ['', 'published', 'draft'];
const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export default async function NewsAdmin(props) {
  if (!(await requireAdminRole())) redirect('/login');
  const sp = (await props.searchParams) || {};
  const status = STATUSES.includes(sp.status) ? sp.status : '';
  const [items, districts] = await Promise.all([listNews({ status }), listDistricts()]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Health news</h2>

      <nav className="flex gap-2">
        {[['', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([s, label]) => (
          <Link key={s} href={s ? `/news?status=${s}` : '/news'}
            className={`rounded-full px-3 py-1 text-xs font-medium ${status === s ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>{label}</Link>
        ))}
      </nav>

      {/* Create form */}
      <form action={createAction} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">New news item</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input name="title_ml" placeholder="Title (ML) *" required className={inp} />
          <input name="title_en" placeholder="Title (EN)" className={inp} />
          <input name="summary_ml" placeholder="Summary (ML) *" required className={inp} />
          <input name="summary_en" placeholder="Summary (EN)" className={inp} />
          <textarea name="body_ml" rows={3} placeholder="Body (ML)" className={`${inp} sm:col-span-2`} />
          <textarea name="body_en" rows={3} placeholder="Body (EN)" className={`${inp} sm:col-span-2`} />
          <input name="source" placeholder="Source (e.g. Kerala Health Dept)" className={inp} />
          <input name="source_url" placeholder="Source URL" className={inp} />
          <input name="image_url" placeholder="Image URL" className={inp} />
          <select name="district_id" className={inp}>
            <option value="">State / national</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
          </select>
          <select name="category" className={inp}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <select name="importance" className={inp}>{IMPORTANCE.map((i) => <option key={i} value={i}>{i}</option>)}</select>
        </div>
        <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Create + publish</button>
      </form>

      {/* Bulk paste */}
      <form action={bulkAction} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">Bulk import (one per line: <span className="font-mono text-xs">title_ml | summary_ml | source | category</span>)</h3>
        <textarea name="paste" rows={4} placeholder="ചെങ്കണ്ണ് വ്യാപനം | ജാഗ്രത നിർദേശം | Kerala Health Dept | outbreak" className={`${inp} w-full`} />
        <div className="flex gap-2">
          <input name="source" placeholder="Default source" className={inp} />
          <select name="category" className={inp}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <button className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-white">Import</button>
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="px-3 py-2">Title</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Importance</th><th className="px-3 py-2">District</th><th className="px-3 py-2">Published</th><th className="px-3 py-2 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((n) => (
              <tr key={n.id} className="align-top">
                <td className="px-3 py-2"><span className="font-medium text-gray-900">{n.title_ml}</span><span className="block text-xs text-gray-400">{n.title_en}</span></td>
                <td className="px-3 py-2 text-gray-600">{n.category}</td>
                <td className="px-3 py-2">{n.importance === 'breaking' ? <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] text-white">breaking</span> : n.importance}</td>
                <td className="px-3 py-2 text-gray-600">{n.district_en || '—'}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{n.is_published ? fmtDate(n.published_at) : 'draft'}</td>
                <td className="px-3 py-2 text-right">
                  <form action={publishAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="publish" value={n.is_published ? '0' : '1'} />
                    <button className={`rounded px-2 py-1 text-xs font-medium text-white ${n.is_published ? 'bg-gray-500' : 'bg-green-600'}`}>{n.is_published ? 'Unpublish' : 'Publish'}</button>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">No news items.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
