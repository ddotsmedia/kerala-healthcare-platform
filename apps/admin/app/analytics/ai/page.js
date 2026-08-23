// Admin AI analytics — interactions, RAG hit rate, knowledge gaps.
// Privacy: the AI log stores only an input hash, so questions are anonymised.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import AnalyticsTabs from '../AnalyticsTabs';
import { getDailyInteractions, getRAGHitRate, getFlagBreakdown, getKnowledgeGaps, getTopRecurring } from '@/lib/aiAnalytics';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'AI analytics · KHP Admin' };

const FLAG_LABEL = { diagnosis_declined: 'Redirected to a professional', emergency: 'Emergency guidance shown' };

export default async function AiAnalytics() {
  if (!(await requireAdminRole())) redirect('/login');
  const [daily, rag, flags, gaps, recurring] = await Promise.all([
    getDailyInteractions(14), getRAGHitRate(7), getFlagBreakdown(7), getKnowledgeGaps(7), getTopRecurring(7)
  ]);
  const total14 = daily.reduce((a, d) => a + d.n, 0);
  const maxD = Math.max(1, ...daily.map((d) => d.n));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">AI assistant analytics</h2>
        <a href="/analytics" className="text-sm font-semibold text-brand hover:underline">← Analytics</a>
      </div>
      <AnalyticsTabs />
      <p className="text-xs text-gray-400">Questions are anonymised — the log stores only a one-way hash, never raw text.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{total14}</p><p className="text-xs text-gray-500">Interactions (14d)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-brand">{rag.rate}%</p><p className="text-xs text-gray-500">RAG hit rate (7d)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-amber-600">{gaps.noRag}</p><p className="text-xs text-gray-500">No-source answers (7d)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-gray-800">{gaps.redirected}</p><p className="text-xs text-gray-500">Redirected to a doctor (7d)</p></div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Daily interactions (14d)</h3>
        <div className="flex items-end gap-1" style={{ height: 90 }}>
          {daily.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center justify-end" title={`${d.day}: ${d.n}`}>
              <div className="w-full rounded-t bg-brand" style={{ height: `${Math.round((d.n / maxD) * 78)}px` }} />
              <span className="mt-1 text-[8px] text-gray-400">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Safety flags (7d)</h3>
        {flags.length === 0 ? <p className="text-sm text-gray-400">No flagged interactions.</p> : (
          <div className="flex flex-wrap gap-2">
            {flags.map((f) => <span key={f.flag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{FLAG_LABEL[f.flag] || f.flag} <span className="font-semibold">{f.n}</span></span>)}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-amber-600">Knowledge gaps — recurring questions with no article match (7d)</h3>
        {gaps.recurring.length === 0 ? <p className="text-sm text-gray-400">No recurring unanswered questions. 🎉</p> : (
          <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-amber-50"><tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Question (anonymised)</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Times asked</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Locale</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {gaps.recurring.map((r) => (
                  <tr key={r.hash}>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">#{r.hash}…</td>
                    <td className="px-3 py-2 text-right font-semibold">{r.asked}</td>
                    <td className="px-3 py-2">{r.locale}</td>
                    <td className="px-3 py-2"><Link href="/cms" className="text-xs font-semibold text-brand hover:underline">Add an article →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-400">These questions returned no knowledge-base article — good candidates for new content.</p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Most-repeated questions (7d)</h3>
        {recurring.length === 0 ? <p className="text-sm text-gray-400">No repeated questions yet.</p> : (
          <div className="flex flex-wrap gap-2">
            {recurring.map((r) => <span key={r.hash} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">#{r.hash}… <span className="font-semibold">{r.asked}×</span> <span className="text-gray-400">({r.answered_with_rag} w/ source)</span></span>)}
          </div>
        )}
      </section>
    </div>
  );
}
