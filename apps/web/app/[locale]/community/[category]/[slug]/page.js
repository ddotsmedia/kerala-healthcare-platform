// Forum post + replies. Doctor replies highlighted. Report + reply.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getPostBySlug } from '@/lib/forum';
import { Disclaimer } from '@/components/hubs/HubParts';
import ReplyForm from '@/components/forum/ReplyForm';
import ReportButton from '@/components/forum/ReportButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const p = await getPostBySlug(params.slug);
  return { title: p ? `${p.title} · MalayaliDoctor` : 'Community' };
}

export default async function PostPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const p = await getPostBySlug(params.slug);
  if (!p) notFound();
  const anon = ml ? 'അജ്ഞാതൻ' : 'Anonymous';

  return (
    <article className="space-y-5">
      <Link href={`/${locale}/community/${p.category_slug}`} className="text-xs font-semibold text-brand hover:underline">
        ← {ml ? (p.category_ml || p.category_en) : p.category_en}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{p.author_name || anon}</span>
          <span>{String(p.created_at).slice(0, 10)}</span>
          <span>👁 {p.views}</span>
          <ReportButton kind="post" id={p.id} locale={locale} />
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{p.body}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">{ml ? 'മറുപടികൾ' : 'Replies'} ({p.replies.length})</h2>
        {p.replies.length === 0 && <p className="text-sm text-gray-500">{ml ? 'ആദ്യ മറുപടി എഴുതൂ' : 'Be the first to reply'}</p>}
        {p.replies.map((r) => (
          <div key={r.id} className={`rounded-xl border p-4 ${r.is_doctor_reply ? 'border-brand bg-teal-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-gray-800">{r.is_anonymous ? anon : (r.author_name || anon)}</span>
              {r.is_doctor_reply && <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">✓ {ml ? 'വെരിഫൈഡ് ഡോക്ടർ' : 'Verified Doctor'}</span>}
              <span className="text-gray-400">{String(r.created_at).slice(0, 10)}</span>
              <ReportButton kind="reply" id={r.id} locale={locale} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{r.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">{ml ? 'മറുപടി എഴുതുക' : 'Write a reply'}</h2>
        <ReplyForm postId={p.id} locale={locale} loginPath={`/${locale}/login`} />
      </section>

      <Disclaimer>{ml ? 'ഇത് പിയർ പിന്തുണ മാത്രം. മറുപടികൾ പ്രസിദ്ധീകരണത്തിന് മുൻപ് പരിശോധിക്കപ്പെടും. വൈദ്യോപദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക.' : 'Peer support only. Replies are moderated before publication. Consult a doctor for medical advice.'}</Disclaimer>
    </article>
  );
}
