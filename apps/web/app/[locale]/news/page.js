// Kerala health news feed — breaking banner, category tabs, district filter, auto-refresh.
import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listNews, breakingNews } from '@/lib/news';
import { listDistricts } from '@/lib/providers';
import { CATEGORY_TABS, categoryLabel } from '@/lib/newsFormat';
import { EmptyState, DistrictFilter, Pagination } from '@khp/ui';
import NewsCard from '@/components/news/NewsCard';
import BreakingBanner from '@/components/news/BreakingBanner';
import NewsAutoRefresh from '@/components/news/NewsAutoRefresh';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const ml = resolveLocale(params.locale) === 'ml';
  return {
    title: ml ? 'കേരള ആരോഗ്യ വാർത്തകൾ · MalayaliDoctor' : 'Kerala Health News · MalayaliDoctor',
    description: ml ? 'കേരള ആരോഗ്യ വകുപ്പ്, WHO, ICMR എന്നിവയിൽ നിന്നുള്ള ആരോഗ്യ വാർത്തകളും ജാഗ്രതാ നിർദേശങ്ങളും.' : 'Health news, outbreak alerts and advisories from Kerala Health Dept, WHO and ICMR.'
  };
}

export default async function NewsPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const category = CATEGORY_TABS.includes(sp.category) ? sp.category : '';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const [items, breaking, districts] = await Promise.all([
    listNews({ category, districtId: sp.district || '', term: sp.q || '', page, limit: LIMIT }),
    breakingNews(5),
    listDistricts()
  ]);
  const basePath = `/${locale}/news`;
  const query = { q: sp.q, category, district: sp.district };
  const tabCls = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="space-y-5">
      <NewsAutoRefresh />
      <BreakingBanner items={breaking} locale={locale} />

      <h1 className="text-xl font-bold">📰 {ml ? 'കേരള ആരോഗ്യ വാർത്തകൾ' : 'Kerala Health News'}</h1>

      <div className="flex flex-wrap gap-2">
        <Link href={basePath} className={tabCls(!category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
        {CATEGORY_TABS.map((c) => (
          <Link key={c} href={`${basePath}?category=${c}`} className={tabCls(category === c)}>{categoryLabel(c, locale)}</Link>
        ))}
      </div>

      <form action={basePath} method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_220px_auto]">
        {category && <input type="hidden" name="category" value={category} />}
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'വാർത്തകൾ തിരയുക…' : 'Search news…'} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {items.length === 0 ? <EmptyState message={ml ? 'വാർത്തകളൊന്നുമില്ല' : 'No news yet'} /> : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((n) => <NewsCard key={n.id} item={n} locale={locale} />)}
          </div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={items.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'വാർത്തകൾ വിവര ആവശ്യത്തിന് മാത്രം — വൈദ്യ ഉപദേശമല്ല. അടിയന്തരഘട്ടത്തിൽ 112/108 വിളിക്കുക.' : 'News is for information only — not medical advice. In an emergency call 112/108.'}
      </div>
    </div>
  );
}
