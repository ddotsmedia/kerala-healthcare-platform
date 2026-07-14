// Q&A — browse published questions by specialty, search, ask.
import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listPublishedQuestions } from '@/lib/qa';
import { listSpecialties } from '@/lib/providers';
import { SpecialtyFilter, EmptyState, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const ml = resolveLocale(params.locale) === 'ml';
  return {
    title: ml ? 'ഡോക്ടറോട് ചോദിക്കൂ · MalayaliDoctor' : 'Ask a Doctor · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ ഡോക്ടർമാർ ഉത്തരം നൽകുന്ന ആരോഗ്യ ചോദ്യങ്ങൾ.' : 'Health questions answered by doctors in Kerala. Educational, moderated Q&A.'
  };
}

export default async function AskPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const [questions, specialties] = await Promise.all([
    listPublishedQuestions({ specialtyId: sp.specialty || '', term: sp.q || '', page, limit: LIMIT }),
    listSpecialties()
  ]);
  const basePath = `/${locale}/ask`;
  const query = { q: sp.q, specialty: sp.specialty };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">❓ {ml ? 'ഡോക്ടറോട് ചോദിക്കൂ' : 'Ask a Doctor'}</h1>
        <Link href={`${basePath}/new`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">✍️ {ml ? 'ചോദ്യം ചോദിക്കുക' : 'Ask a Question'}</Link>
      </div>

      <form action={basePath} method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_220px_auto]">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'ചോദ്യങ്ങൾ തിരയുക…' : 'Search questions…'} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <SpecialtyFilter specialties={specialties} selected={sp.specialty || ''} locale={locale} />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {questions.length === 0 ? <EmptyState message={ml ? 'ചോദ്യങ്ങളൊന്നുമില്ല' : 'No questions yet'} /> : (
        <>
          <div className="space-y-3">
            {questions.map((q) => (
              <Link key={q.id} href={`${basePath}/${q.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <h3 className="font-semibold text-gray-900">{q.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{q.body}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-400">
                  {(q.specialty_en || q.specialty_ml) && <span>{ml ? q.specialty_ml : q.specialty_en}</span>}
                  <span>💬 {q.answer_count} {ml ? 'ഉത്തരങ്ങൾ' : 'answers'}</span>
                  <span>👁 {q.views}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={questions.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'അടിയന്തര സാഹചര്യങ്ങൾക്ക് ഇത് ഉപയോഗിക്കരുത് (112/108 വിളിക്കുക). ഉത്തരങ്ങൾ വിദ്യാഭ്യാസപരം മാത്രം — രോഗനിർണയമോ ചികിത്സയോ അല്ല.' : 'Not for emergency situations (call 112/108). Answers are educational only — not a diagnosis or treatment.'}
      </div>
    </div>
  );
}
