// Health knowledge feed — latest published content with type tabs.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { listPublishedContent } from '@/lib/knowledge';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
import { EmptyState, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;
const TYPES = ['article', 'disease', 'procedure', 'news'];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'health')} · ${t(locale, 'site')}`, description: t(locale, 'health') };
}

export default async function HealthFeed(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const type = (searchParams && searchParams.type) || '';
  const page = Math.max(1, parseInt(searchParams && searchParams.page, 10) || 1);
  const items = await listPublishedContent({ type: type || undefined, page, limit: LIMIT });
  const basePath = `/${locale}/health`;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'health')}</h1>
      <KnowledgeDisclaimer locale={locale} />
      <nav className="flex flex-wrap gap-2">
        <Link href={basePath} className={`rounded-full px-3 py-1 text-xs font-medium ${!type ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>All</Link>
        {TYPES.map((ty) => (
          <Link key={ty} href={`${basePath}?type=${ty}`} className={`rounded-full px-3 py-1 text-xs font-medium ${type === ty ? 'bg-brand text-white' : 'border border-gray-300 bg-white'}`}>{ty}</Link>
        ))}
      </nav>

      {items.length === 0 ? <EmptyState message={t(locale, 'no_results')} /> : (
        <>
          <div className="grid gap-3">
            {items.map((c) => (
              <Link key={c.id} href={`/${locale}/health/${c.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
                <h3 className="font-semibold">{locale === 'ml' ? (c.title_ml || c.title_en) : c.title_en}</h3>
                <p className="mt-1 text-sm text-gray-600">{locale === 'ml' ? (c.excerpt_ml || c.excerpt_en) : c.excerpt_en}</p>
                <span className="mt-1 inline-block text-xs text-gray-400">{c.type}</span>
              </Link>
            ))}
          </div>
          <Pagination basePath={basePath} query={{ type }} page={page} hasNext={items.length === LIMIT} locale={locale} />
        </>
      )}
    </div>
  );
}
