// CMS content list with status filters + create form.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { listContent } from '@/lib/cms';
import { createAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'CMS · KHP Admin' };

const STATUSES = ['draft', 'in_review', 'approved', 'published', 'archived'];
const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';

export default async function CmsList({ searchParams }) {
  if (!requireAdminRole()) redirect('/login');
  const status = (searchParams && searchParams.status) || '';
  const items = await listContent({ status: status || undefined });

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold">Content</h2>
      <nav className="flex flex-wrap gap-2">
        <Link href="/cms" className={`rounded-full px-3 py-1 text-xs font-medium ${!status ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/cms?status=${s}`} className={`rounded-full px-3 py-1 text-xs font-medium ${status === s ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>{s}</Link>
        ))}
      </nav>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {items.map((c) => (
          <li key={c.id}>
            <Link href={`/cms/${c.id}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
              <span>{c.title_en || c.slug} <span className="text-xs text-gray-400">· {c.type}</span></span>
              <span className="text-xs text-gray-500">{c.status}</span>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-500">No content</li>}
      </ul>

      <form action={createAction} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">New draft</h3>
        <div className="grid grid-cols-2 gap-2">
          <input name="slug" placeholder="slug" required className={inp} />
          <select name="type" className={inp}><option value="article">article</option><option value="disease">disease</option><option value="procedure">procedure</option><option value="news">news</option><option value="faq">faq</option></select>
          <input name="title_en" placeholder="Title (EN)" required className={inp} />
          <input name="title_ml" placeholder="Title (ML)" className={inp} />
        </div>
        <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Create draft</button>
      </form>
    </div>
  );
}
