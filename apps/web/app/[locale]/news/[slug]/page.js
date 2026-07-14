// Health-news article — source attribution, related news, WhatsApp share, NewsArticle JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getNewsBySlug, relatedNews } from '@/lib/news';
import { categoryLabel, categoryClass, relativeTime } from '@/lib/newsFormat';
import { newsArticleSchema, SITE } from '@/lib/schema';
import NewsCard from '@/components/news/NewsCard';
import WhatsAppShare from '@/components/whatsapp/WhatsAppShare';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const n = await getNewsBySlug(params.slug);
  if (!n) return { title: ml ? 'വാർത്ത' : 'News' };
  const title = (ml ? n.title_ml : n.title_en) || n.title_ml;
  return {
    title: `${title} · MalayaliDoctor`.slice(0, 65),
    description: ((ml ? n.summary_ml : n.summary_en) || n.summary_ml || '').slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/news/${n.slug}` }
  };
}

export default async function NewsArticlePage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const n = await getNewsBySlug(params.slug);
  if (!n) notFound();
  const related = await relatedNews(n.category, n.id, 4);
  const url = `${SITE}/${locale}/news/${n.slug}`;
  const title = (ml ? n.title_ml : n.title_en) || n.title_ml;
  const body = (ml ? n.body_ml : n.body_en) || n.body_ml || (ml ? n.summary_ml : n.summary_en) || n.summary_ml;
  const district = ml ? n.district_ml : n.district_en;

  const ld = [
    newsArticleSchema(n, locale, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'വാർത്തകൾ' : 'News', item: `${SITE}/${locale}/news` },
        { '@type': 'ListItem', position: 3, name: title }
      ]
    }
  ];

  return (
    <article className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <WhatsAppShare locale={locale} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/news`} className="hover:text-brand">{ml ? 'വാർത്തകൾ' : 'News'}</Link> › <span className="text-gray-700">{title}</span>
      </nav>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded px-1.5 py-0.5 font-medium ${categoryClass(n.category)}`}>{categoryLabel(n.category, locale)}</span>
          {n.importance === 'breaking' && <span className="rounded bg-red-600 px-1.5 py-0.5 font-medium text-white">{ml ? 'ബ്രേക്കിംഗ്' : 'BREAKING'}</span>}
          {district && <span className="text-gray-400">📍 {district}</span>}
          <span className="text-gray-400">· {relativeTime(n.published_at, locale)}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-base text-gray-600">{(ml ? n.summary_ml : n.summary_en) || n.summary_ml}</p>
      </header>

      {n.image_url && <img src={n.image_url} alt={title} className="w-full rounded-xl" />}

      <div className="whitespace-pre-line text-[15px] leading-relaxed text-gray-800">{body}</div>

      {(n.source || n.source_url) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
          <span className="font-medium text-gray-700">{ml ? 'ഉറവിടം' : 'Source'}: </span>
          {n.source_url
            ? <a href={n.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand underline">{n.source || n.source_url}</a>
            : <span className="text-gray-700">{n.source}</span>}
        </div>
      )}

      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വാർത്ത വിവര ആവശ്യത്തിന് മാത്രം — വൈദ്യ ഉപദേശമല്ല. രോഗലക്ഷണങ്ങൾക്ക് ഒരു ഡോക്ടറെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112/108.' : 'This news is for information only — not medical advice. For symptoms, consult a doctor. Emergency 112/108.'}
      </div>

      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">{ml ? 'അനുബന്ധ വാർത്തകൾ' : 'Related news'}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => <NewsCard key={r.id} item={r} locale={locale} />)}
          </div>
        </section>
      )}
    </article>
  );
}
