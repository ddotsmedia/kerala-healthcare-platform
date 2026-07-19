// Forum moderation queue. Server component. Filter by status.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { listPosts, listReplies, counts } from '@/lib/forum';
import ForumTable from './ForumTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Forum moderation · KHP Admin' };

const TABS = ['pending', 'approved', 'rejected', 'flagged'];

export default async function ForumQueue(props) {
  if (!(await requireAdminRole())) redirect('/login');
  const searchParams = await props.searchParams;
  const status = (searchParams && TABS.includes(searchParams.status) ? searchParams.status : 'pending');
  const [posts, replies, c] = await Promise.all([listPosts(status), listReplies(status), counts()]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Forum moderation</h2>
      <nav className="flex flex-wrap gap-2">
        {TABS.map((s) => (
          <Link key={s} href={`/forum?status=${s}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${s === status ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {s}<span className={`rounded-full px-1.5 text-[10px] ${s === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{c[s] || 0}</span>
          </Link>
        ))}
      </nav>
      <ForumTable posts={posts} replies={replies} status={status} />
    </div>
  );
}
