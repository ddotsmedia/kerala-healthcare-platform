// Article detail — reading progress, TOC, prose body, share, related, JSON-LD.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getPublishedContent, relatedContent, contentDoctors } from '@/lib/knowledge';
import { medicalWebPageSchema, SITE } from '@/lib/schema';
import ArticleCard, { catLabel } from '@/components/health/ArticleCard';
import { CopyButton } from '@/components/profile/ShareButton';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
import { DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const c = await getPublishedContent(params.slug);
  if (!c) return { title: t(locale, 'health') };
  const title = locale === 'ml' ? (c.meta_title_ml || c.title_ml || c.title_en) : (c.meta_title_en || c.title_en);
  const desc = locale === 'ml' ? (c.meta_desc_ml || c.excerpt_ml || '') : (c.meta_desc_en || c.excerpt_en || '');
  return { title: String(title).slice(0, 60), description: String(desc).slice(0, 160) };
}

function buildBody(raw) {
  const toc = [];
  if (!raw) return { html: '', toc, isHtml: false };
  const isHtml = /<(h[23]|p|ul|ol|strong)\b/i.test(raw);
  if (!isHtml) return { html: raw, toc, isHtml: false };
  const html = raw.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (m, tag, attrs, text) => {
    const clean = text.replace(/<[^>]+>/g, '').trim();
    const id = (clean.toLowerCase().replace(/[^a-z0-9ഀ-ൿ]+/g, '-').replace(/^-|-$/g, '')) || `s${toc.length}`;
    toc.push({ id, text: clean, level: tag.toLowerCase() === 'h3' ? 3 : 2 });
    return `<${tag} id="${id}"${attrs}>${text}</${tag}>`;
  });
  return { html, toc, isHtml: true };
}

export default async function ContentPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const c = await getPublishedContent(params.slug);
  if (!c) notFound();

  const [related, doctors] = await Promise.all([
    relatedContent(c.category, c.id, 3),
    contentDoctors(c.id, 3)
  ]);

  const title = ml ? (c.title_ml || c.title_en) : c.title_en;
  const rawBody = (ml ? (c.body_ml || c.body_en) : c.body_en) || '';
  const { html, toc, isHtml } = buildBody(rawBody);
  const readMin = Math.max(1, Math.ceil(rawBody.length / 900));
  const date = c.published_at ? String(c.published_at).slice(0, 10) : '';
  const url = `${SITE}/${locale}/health/${c.slug}`;
  const waMsg = `${title} — MalayaliDoctor.com: ${url}`;
  const ld = [
    medicalWebPageSchema(title, (ml ? c.excerpt_ml : c.excerpt_en) || '', url),
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: title, datePublished: c.published_at || undefined,
      author: c.author_name ? { '@type': 'Person', name: c.author_name } : undefined,
      mainEntityOfPage: url
    }
  ];

  return (
    <article className="space-y-5">
      <span className="reading-progress" aria-hidden="true" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header className="space-y-2">
        {c.category && <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand">{catLabel(c.category, locale)}</span>}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {c.author_name && <span>{c.author_name}</span>}
          {date && <span>{date}</span>}
          <span>{readMin} {ml ? 'മിനിറ്റ് വായന' : 'min read'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a href={`https://wa.me/?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">💬 WhatsApp</a>
          <CopyButton text={url} locale={locale} />
        </div>
      </header>

      <KnowledgeDisclaimer locale={locale} />

      {toc.length > 1 && (
        <nav className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase text-gray-500">{ml ? 'ഉള്ളടക്കം' : 'Contents'}</h2>
          <ul className="space-y-1 text-sm">
            {toc.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'ml-4' : ''}>
                <a href={`#${h.id}`} className="text-brand hover:underline">{h.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {isHtml
        ? <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
        : <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{html}</div>}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ ലേഖനം വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രം. വൈദ്യോപദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക.' : 'This article is for education only. Consult a doctor for medical advice.'}
      </div>

      {doctors.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">{ml ? 'ബന്ധപ്പെട്ട ഡോക്ടർമാർ' : 'Related doctors'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">{ml ? 'അനുബന്ധ ലേഖനങ്ങൾ' : 'Related articles'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((r) => <ArticleCard key={r.id} item={r} locale={locale} />)}
          </div>
        </section>
      )}

      <Link href={`/${locale}/doctors`} className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {t(locale, 'find_a_doctor')}
      </Link>
    </article>
  );
}
