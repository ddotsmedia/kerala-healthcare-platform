// Admin content analytics — top articles, category performance, zero-view.

import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import { getTopArticles, getArticlesByCategory, getZeroViewArticles } from '@/lib/contentAnalytics';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Content analytics · KHP Admin' };

export default async function ContentAnalytics() {
  if (!(await requireAdminRole())) redirect('/login');
  const [top, byCat, zero] = await Promise.all([
    getTopArticles(30, 20), getArticlesByCategory(30), getZeroViewArticles(30, 30)
  ]);
  const maxCat = Math.max(1, ...byCat.map((c) => c.views));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Content analytics</h2>
        <a href="/analytics" className="text-sm font-semibold text-brand hover:underline">← Analytics</a>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Top articles (30d)</h3>
        {top.length === 0 ? <p className="text-sm text-gray-400">No article views yet.</p> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Article</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Category</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Views</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Shares</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Share %</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {top.map((a) => (
                  <tr key={a.content_id}>
                    <td className="max-w-xs truncate px-3 py-2 font-medium">{a.title_en || a.slug}</td>
                    <td className="px-3 py-2 text-gray-500">{a.category || a.type}</td>
                    <td className="px-3 py-2 text-right font-semibold">{a.views}</td>
                    <td className="px-3 py-2 text-right">{a.shares}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{a.views > 0 ? Math.round((a.shares / a.views) * 1000) / 10 : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Category performance (30d)</h3>
        {byCat.length === 0 ? <p className="text-sm text-gray-400">No data.</p> : (
          <div className="space-y-2">
            {byCat.map((c) => (
              <div key={c.category} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-sm capitalize text-gray-700">{c.category}</span>
                <div className="h-4 flex-1 rounded bg-gray-100"><div className="h-4 rounded bg-brand" style={{ width: `${Math.round((c.views / maxCat) * 100)}%` }} /></div>
                <span className="w-20 text-right text-xs text-gray-500">{c.views} · {c.articles} arts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-amber-600">Published articles with 0 views — need promotion (30d)</h3>
        {zero.length === 0 ? <p className="text-sm text-gray-400">Every published article has views. 🎉</p> : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {zero.map((a) => (
              <li key={a.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                <span className="font-medium text-gray-800">{a.title_en || a.slug}</span>
                <span className="ml-1 text-xs text-gray-500">· {a.category || a.type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
