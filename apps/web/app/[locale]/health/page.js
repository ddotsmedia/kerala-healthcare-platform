// Health articles index — hero, category tabs, featured, searchable grid.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';
import { listPublishedContent } from '@/lib/knowledge';
import { FullBleed } from '@/components/home/HomeSections';
import ArticleCard from '@/components/health/ArticleCard';
import ArticleList from '@/components/health/ArticleList';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';
import { EmptyState, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 12;

const CATS = [
  { key: '', ml: 'എല്ലാം', en: 'All' },
  { key: 'disease', ml: 'രോഗം', en: 'Disease' },
  { key: 'nutrition', ml: 'പോഷകാഹാരം', en: 'Nutrition' },
  { key: 'mental-health', ml: 'മാനസികാരോഗ്യം', en: 'Mental Health' },
  { key: 'womens-health', ml: 'സ്ത്രീ ആരോഗ്യം', en: "Women's Health" },
  { key: 'child-health', ml: 'ശിശു ആരോഗ്യം', en: 'Child Health' },
  { key: 'ayurveda', ml: 'ആയുർവേദം', en: 'Ayurveda' },
  { key: 'news', ml: 'വാർത്ത', en: 'News' }
];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'health')} · ${t(locale, 'site')}`, description: t(locale, 'health') };
}

export default async function HealthFeed(props) {
  const searchParams = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const category = searchParams.category || '';
  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);
  const items = await listPublishedContent({ category: category || undefined, page, limit: LIMIT });
  const basePath = `/${locale}/health`;
  const featured = page === 1 && !category && items.length > 0 ? items[0] : null;
  const rest = featured ? items.slice(1) : items;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold">{ml ? 'ആരോഗ്യ വിവരങ്ങൾ' : 'Health Information'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'മലയാളത്തിൽ വിശ്വസനീയമായ ആരോഗ്യ വിജ്ഞാനം' : 'Trusted health knowledge in Malayalam'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-8">
        <KnowledgeDisclaimer locale={locale} />
        <nav className="mt-4 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <Link key={c.key} href={c.key ? `${basePath}?category=${c.key}` : basePath}
              className={`rounded-full px-3 py-1 text-xs font-medium ${category === c.key ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
              {ml ? c.ml : c.en}
            </Link>
          ))}
        </nav>

        {items.length === 0 ? (
          <div className="mt-6"><EmptyState message={t(locale, 'no_results')} /></div>
        ) : (
          <div className="mt-6 space-y-6">
            {featured && <ArticleCard item={featured} locale={locale} featured />}
            <ArticleList items={rest} locale={locale} />
            <Pagination basePath={basePath} query={{ category }} page={page} hasNext={items.length === LIMIT} locale={locale} />
          </div>
        )}
      </FullBleed>
    </div>
  );
}
