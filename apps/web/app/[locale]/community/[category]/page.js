// Forum category — posts list (latest/popular) + new post.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getCategoryBySlug, listPosts } from '@/lib/forum';
import { HubHero } from '@/components/hubs/HubParts';
import { TrustSection } from '@/components/trust/TrustParts';
import { EmptyState, Pagination } from '@khp/ui';
import NewPostForm from '@/components/forum/NewPostForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const c = await getCategoryBySlug(params.category);
  if (!c) return { title: 'Community' };
  const name = locale === 'ml' ? (c.name_ml || c.name_en) : c.name_en;
  return { title: `${name} · ${locale === 'ml' ? 'കമ്മ്യൂണിറ്റി' : 'Community'} | MalayaliDoctor` };
}

export default async function CategoryPage(props) {
  const params = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const c = await getCategoryBySlug(params.category);
  if (!c) notFound();

  const sort = sp.sort === 'popular' ? 'popular' : 'latest';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const posts = await listPosts(c.id, { sort, page, limit: 20 });
  const name = ml ? (c.name_ml || c.name_en) : c.name_en;
  const basePath = `/${locale}/community/${c.slug}`;

  return (
    <div className="-my-6">
      <HubHero title={`${c.icon || ''} ${name}`} subtitle={ml ? (c.description_ml || c.description_en) : c.description_en} />

      <TrustSection>
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs">
              {[['latest', ml ? 'പുതിയത്' : 'Latest'], ['popular', ml ? 'ജനപ്രിയം' : 'Popular']].map(([s, l]) => (
                <Link key={s} href={`${basePath}?sort=${s}`} className={`rounded-full px-3 py-1 font-medium ${sort === s ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>{l}</Link>
              ))}
            </div>
            <NewPostForm categoryId={c.id} locale={locale} loginPath={`/${locale}/login`} />
          </div>

          {posts.length === 0 ? <EmptyState message={ml ? 'ഇതുവരെ പോസ്റ്റുകൾ ഇല്ല' : 'No posts yet'} /> : (
            <>
              <div className="space-y-2">
                {posts.map((p) => (
                  <Link key={p.id} href={`${basePath}/${p.slug}`}
                    className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-2">
                      {p.is_pinned && <span className="text-xs">📌</span>}
                      <h3 className="truncate font-semibold text-gray-900">{p.title}</h3>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
                      <span>{p.author_name || (ml ? 'അജ്ഞാതൻ' : 'Anonymous')}</span>
                      <span>👁 {p.views}</span>
                      <span>💬 {p.reply_count}</span>
                      <span>{String(p.created_at).slice(0, 10)}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination basePath={basePath} query={{ sort }} page={page} hasNext={posts.length === 20} locale={locale} />
            </>
          )}
        </div>
      </TrustSection>
    </div>
  );
}
