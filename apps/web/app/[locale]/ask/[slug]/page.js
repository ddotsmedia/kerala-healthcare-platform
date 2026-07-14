// Q&A question detail — question + doctor answers + helpful votes + related.
// QAPage + BreadcrumbList JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getQuestionBySlug, relatedQuestions } from '@/lib/qa';
import { qaPageSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import HelpfulButton from '@/components/qa/HelpfulButton';

export const dynamic = 'force-dynamic';
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const q = await getQuestionBySlug(params.slug);
  if (!q) return { title: locale === 'ml' ? 'ചോദ്യം' : 'Question' };
  return {
    title: `${q.title} | MalayaliDoctor`.slice(0, 65),
    description: q.body.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/ask/${q.slug}` }
  };
}

export default async function QuestionPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const q = await getQuestionBySlug(params.slug);
  if (!q) notFound();
  const related = await relatedQuestions(q.specialty_id, q.id, 5);
  const url = `${SITE}/${locale}/ask/${q.slug}`;
  const answers = q.answers || [];

  const ld = [
    qaPageSchema(q, url),
    medicalWebPageSchema(q.title, q.body.slice(0, 200), url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ചോദ്യങ്ങൾ' : 'Ask', item: `${SITE}/${locale}/ask` },
        { '@type': 'ListItem', position: 3, name: q.title }
      ]
    }
  ];

  return (
    <article className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/ask`} className="hover:text-brand">{ml ? 'ചോദ്യങ്ങൾ' : 'Ask'}</Link> › <span className="text-gray-700">{q.title}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">{q.title}</h1>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{q.body}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-400">
          {(q.specialty_en || q.specialty_ml) && <span>{ml ? q.specialty_ml : q.specialty_en}</span>}
          <span>👁 {q.views}</span><span>{fmtDate(q.created_at)}</span>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">{answers.length} {ml ? 'ഉത്തരങ്ങൾ' : 'answers'}</h2>
        {answers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{ml ? 'ഇതുവരെ ഒരു ഡോക്ടറും ഉത്തരം നൽകിയിട്ടില്ല.' : 'No doctor has answered this yet.'}</p>
        ) : answers.map((a) => (
          <div key={a.id} className={`rounded-xl border bg-white p-4 shadow-sm ${a.is_accepted ? 'border-green-300' : 'border-gray-200'}`}>
            {a.is_accepted && <span className="mb-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">✓ {ml ? 'സ്വീകരിച്ചത്' : 'Accepted'}</span>}
            <p className="whitespace-pre-line text-sm text-gray-800">{a.body}</p>
            <div className="mt-2 flex items-center justify-between">
              <Link href={`/${locale}/doctors/${a.doctor_slug}`} className="text-xs font-medium text-brand">— Dr. {a.doctor_name}{a.doctor_specialty_en ? `, ${a.doctor_specialty_en}` : ''}</Link>
              <HelpfulButton answerId={a.id} initialCount={a.helpful_count} locale={locale} />
            </div>
          </div>
        ))}
      </section>

      <Link href={`/${locale}/ask/new`} className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">✍️ {ml ? 'സമാനമായ ചോദ്യം ചോദിക്കുക' : 'Ask a similar question'}</Link>

      {related.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'അനുബന്ധ ചോദ്യങ്ങൾ' : 'Related questions'}</h2>
          <ul className="space-y-1">{related.map((r) => <li key={r.slug}><Link href={`/${locale}/ask/${r.slug}`} className="text-sm text-brand hover:underline">{r.title}</Link></li>)}</ul>
        </section>
      )}

      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ ഉത്തരങ്ങൾ വിദ്യാഭ്യാസപരം മാത്രം — രോഗനിർണയമോ ചികിത്സയോ അല്ല. അടിയന്തരഘട്ടത്തിൽ 112/108 വിളിക്കുക.' : 'These answers are educational only — not a diagnosis or treatment. In an emergency call 112/108.'}
      </div>
    </article>
  );
}
