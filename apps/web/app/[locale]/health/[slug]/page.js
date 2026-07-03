// Public knowledge content page (SSR). MedicalWebPage JSON-LD + persistent
// disclaimer + related specialists.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getPublishedContent } from '@/lib/knowledge';
import { medicalWebPageSchema, SITE } from '@/lib/schema';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';

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

export default async function ContentPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const c = await getPublishedContent(params.slug);
  if (!c) notFound();

  const title = locale === 'ml' ? (c.title_ml || c.title_en) : c.title_en;
  const body = locale === 'ml' ? (c.body_ml || c.body_en) : c.body_en;
  const url = `${SITE}/${locale}/health/${c.slug}`;
  const ld = medicalWebPageSchema(title, (locale === 'ml' ? c.excerpt_ml : c.excerpt_en) || '', url);

  return (
    <article className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <KnowledgeDisclaimer locale={locale} />
      {body && <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{body}</div>}

      {c.type === 'disease' && c.slug && (
        <Link href={`/${locale}/diseases/${c.slug}`} className="inline-block text-sm text-brand underline">
          {t(locale, 'diseases')} →
        </Link>
      )}

      {c.specialties && c.specialties.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'related_specialists')}</h2>
          <div className="flex flex-wrap gap-2">
            {c.specialties.map((sp) => (
              <span key={sp.slug} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {locale === 'ml' ? sp.name_ml : sp.name_en}
              </span>
            ))}
          </div>
        </section>
      )}

      <Link href={`/${locale}/doctors`} className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {t(locale, 'find_a_doctor')}
      </Link>
    </article>
  );
}
