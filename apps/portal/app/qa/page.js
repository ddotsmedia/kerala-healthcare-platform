// Doctor Q&A — answer published patient questions (own specialty), track my answers.
import Link from 'next/link';
import { currentDoctorId } from '@/lib/profile';
import { listAnswerable, myAnswers } from '@/lib/qa';
import { EmptyState } from '@khp/ui';
import { answerAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Q&A · KHP Portal' };

const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');
const TABS = ['answer', 'mine'];
const badge = { pending: 'bg-amber-100 text-amber-700', published: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

export default async function QaPage(props) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return <EmptyState message="No provider loaded." />;
  const searchParams = await props.searchParams;
  const tab = (searchParams && TABS.includes(searchParams.tab)) ? searchParams.tab : 'answer';
  const all = (searchParams && searchParams.all === '1');
  const [answerable, mine] = await Promise.all([listAnswerable(doctorId, { onlyMine: !all }), myAnswers(doctorId)]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Patient Q&amp;A</h2>
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t} href={`/qa?tab=${t}`}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${t === tab ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {t === 'answer' ? 'To answer' : 'My answers'}
          </Link>
        ))}
      </nav>

      {tab === 'answer' ? (
        <>
          <p className="text-xs text-gray-500">
            {all ? 'Showing all specialties. ' : 'Showing your specialty. '}
            <Link href={`/qa?tab=answer${all ? '' : '&all=1'}`} className="text-brand underline">{all ? 'Only my specialty' : 'Show all'}</Link>
          </p>
          {answerable.length === 0 ? <EmptyState message="No questions awaiting your answer." /> : (
            <ul className="space-y-3">
              {answerable.map((q) => (
                <li key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="font-medium text-gray-900">{q.title}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{q.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{(q.specialty_en || '—')} · {q.answer_count} answers · {fmtDate(q.created_at)}</p>
                  <form action={answerAction} className="mt-3 space-y-2">
                    <input type="hidden" name="question_id" value={q.id} />
                    <textarea name="body" rows={3} required minLength={10} maxLength={4000}
                      placeholder="Educational answer — no personal diagnosis. Recommend consulting a doctor for specifics."
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                    <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white">Submit answer for moderation</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Answers are public + educational. No personal diagnosis or treatment. Answers are reviewed before publishing.
          </div>
        </>
      ) : (
        mine.length === 0 ? <EmptyState message="You haven't answered any questions yet." /> : (
          <ul className="space-y-3">
            {mine.map((a) => (
              <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/qa`} className="font-medium text-gray-900">{a.question_title}</Link>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badge[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{a.body}</p>
                <p className="mt-1 text-xs text-gray-400">{a.is_accepted ? '✓ Accepted · ' : ''}👍 {a.helpful_count} · {fmtDate(a.created_at)}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
