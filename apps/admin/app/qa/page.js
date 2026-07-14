// Q&A moderation — questions queue + answers queue, approve/reject, accept answer.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminRole } from '@/lib/auth';
import {
  listQuestionsByStatus, listAnswersByStatus, questionCounts, answerCounts
} from '@/lib/qa';
import { moderateAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Q&A · KHP Admin' };

const STATUSES = ['pending', 'published', 'rejected'];
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

function RejectForm({ kind, id }) {
  return (
    <form action={moderateAction} className="flex gap-1">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="action" value="reject" />
      <input type="hidden" name="id" value={id} />
      <input name="reason" placeholder="Reason" className="w-28 rounded border border-gray-300 px-1.5 py-1 text-xs" />
      <button className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Reject</button>
    </form>
  );
}

function ActBtn({ kind, action, id, label, cls }) {
  return (
    <form action={moderateAction}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="id" value={id} />
      <button className={`rounded px-2 py-1 text-xs font-medium text-white ${cls}`}>{label}</button>
    </form>
  );
}

export default async function QaModeration(props) {
  if (!(await requireAdminRole())) redirect('/login');
  const sp = (await props.searchParams) || {};
  const view = sp.view === 'answers' ? 'answers' : 'questions';
  const status = STATUSES.includes(sp.status) ? sp.status : 'pending';
  const [qc, ac] = await Promise.all([questionCounts(), answerCounts()]);
  const items = view === 'questions'
    ? await listQuestionsByStatus(status)
    : await listAnswersByStatus(status);
  const counts = view === 'questions' ? qc : ac;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Q&amp;A moderation</h2>

      <nav className="flex gap-2">
        {['questions', 'answers'].map((v) => (
          <Link key={v} href={`/qa?view=${v}&status=${status}`}
            className={`rounded-lg px-3 py-1 text-sm font-medium capitalize ${v === view ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {v} <span className="text-xs opacity-70">({(v === 'questions' ? qc : ac).pending})</span>
          </Link>
        ))}
      </nav>

      <nav className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={`/qa?view=${view}&status=${s}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${s === status ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {s}<span className={`rounded-full px-1.5 text-[10px] ${s === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{counts[s] || 0}</span>
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No {status} {view}.</p>
      ) : view === 'questions' ? (
        <ul className="space-y-3">
          {items.map((q) => (
            <li key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900">{q.title}</p>
              <p className="mt-0.5 text-sm text-gray-600">{q.body}</p>
              <p className="mt-1 text-xs text-gray-400">
                {(q.specialty_en || '—')} · {q.is_anonymous ? 'Anonymous' : (q.patient_name || '—')} · {fmtDate(q.created_at)}
                {q.rejection_reason ? ` · Reason: ${q.rejection_reason}` : ''}
              </p>
              {status === 'pending' && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ActBtn kind="question" action="approve" id={q.id} label="Approve" cls="bg-green-600" />
                  <RejectForm kind="question" id={q.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400">Q: {a.question_title}</p>
              <p className="mt-1 text-sm text-gray-800">{a.body}</p>
              <p className="mt-1 text-xs text-gray-400">
                Dr. {a.doctor_name} · {fmtDate(a.created_at)} {a.is_accepted ? '· ✓ accepted' : ''}
                {a.rejection_reason ? ` · Reason: ${a.rejection_reason}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {status === 'pending' && <>
                  <ActBtn kind="answer" action="approve" id={a.id} label="Approve" cls="bg-green-600" />
                  <RejectForm kind="answer" id={a.id} />
                </>}
                {status === 'published' && !a.is_accepted &&
                  <ActBtn kind="answer" action="accept" id={a.id} label="Mark accepted" cls="bg-brand" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
