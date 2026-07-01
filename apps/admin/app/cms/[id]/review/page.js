// Reviewer view — side-by-side ml/en with approve / reject.

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getContent } from '@/lib/cms';
import { approveAction, rejectAction } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function CmsReview({ params }) {
  if (!requireAdminRole()) redirect('/login');
  const c = await getContent(params.id);
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <Link href={`/cms/${c.id}`} className="text-sm text-brand">← Edit</Link>
      <h2 className="text-base font-semibold">Review: {c.title_en || c.slug}</h2>
      <p className="text-xs text-gray-500">Status: {c.status}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">English</h3>
          <p className="font-medium">{c.title_en}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{c.body_en}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Malayalam</h3>
          <p className="font-medium">{c.title_ml}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{c.body_ml}</p>
        </div>
      </div>

      {c.status === 'in_review' ? (
        <div className="flex gap-3">
          <form action={approveAction}><input type="hidden" name="id" value={c.id} />
            <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Approve</button></form>
          <form action={rejectAction}><input type="hidden" name="id" value={c.id} />
            <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600">Reject (back to draft)</button></form>
        </div>
      ) : <p className="text-sm text-gray-500">Not in review.</p>}
    </div>
  );
}
