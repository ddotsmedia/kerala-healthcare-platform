// ArticleCard.js — health article list item. Pure.

import Link from 'next/link';

const CAT_LABEL = {
  disease: { ml: 'രോഗം', en: 'Disease' },
  nutrition: { ml: 'പോഷകാഹാരം', en: 'Nutrition' },
  'mental-health': { ml: 'മാനസികാരോഗ്യം', en: 'Mental Health' },
  'womens-health': { ml: 'സ്ത്രീ ആരോഗ്യം', en: "Women's Health" },
  'child-health': { ml: 'ശിശു ആരോഗ്യം', en: 'Child Health' },
  ayurveda: { ml: 'ആയുർവേദം', en: 'Ayurveda' },
  news: { ml: 'വാർത്ത', en: 'News' }
};

export function catLabel(cat, locale = 'ml') {
  const c = CAT_LABEL[cat];
  return c ? (locale === 'ml' ? c.ml : c.en) : (cat || (locale === 'ml' ? 'ലേഖനം' : 'Article'));
}

export default function ArticleCard({ item, locale = 'ml', featured = false }) {
  const ml = locale === 'ml';
  const title = ml ? (item.title_ml || item.title_en) : item.title_en;
  const excerpt = ml ? (item.excerpt_ml || item.excerpt_en) : item.excerpt_en;
  const date = item.published_at ? String(item.published_at).slice(0, 10) : '';
  return (
    <Link href={`/${locale}/health/${item.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${featured ? 'sm:flex-row' : ''}`}>
      {item.featured_image_url
        ? <img src={item.featured_image_url} alt={title || ''} loading="lazy" decoding="async" className={`w-full object-cover ${featured ? 'sm:h-auto sm:w-1/2' : 'h-36'}`} />
        : <div className={`w-full bg-gradient-to-br from-teal-400 to-teal-600 ${featured ? 'h-40 sm:h-auto sm:w-1/2' : 'h-36'}`} />}
      <div className="flex flex-1 flex-col p-4">
        {item.category && <span className="mb-1 inline-block w-fit rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{catLabel(item.category, locale)}</span>}
        <h3 className={`font-bold text-gray-900 ${featured ? 'text-lg' : 'line-clamp-2 text-base'}`}>{title}</h3>
        {excerpt && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{excerpt}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-2 text-xs text-gray-400">
          {item.author_name && <span>{item.author_name}</span>}
          {item.read_min != null && <span>{item.read_min} {ml ? 'മിനിറ്റ് വായന' : 'min read'}</span>}
          {date && <span>{date}</span>}
        </div>
      </div>
    </Link>
  );
}
