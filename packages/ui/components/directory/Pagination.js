// Pagination.js — prev/next navigation that preserves the current query string.
// Server-render friendly (plain <a> links). `query` is a plain object of the
// active filters (without `page`).

const T = {
  prev: { ml: 'മുമ്പത്തെ', en: 'Previous' },
  next: { ml: 'അടുത്തത്', en: 'Next' },
  page: { ml: 'പേജ്', en: 'Page' }
};

function withPage(basePath, query, page) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v != null && v !== '') params.set(k, v);
  });
  params.set('page', String(page));
  return `${basePath}?${params.toString()}`;
}

export default function Pagination({ basePath, query = {}, page = 1, hasNext = false, locale = 'ml' }) {
  const prevDisabled = page <= 1;
  const linkCls = 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium';
  const offCls = 'pointer-events-none opacity-40';
  return (
    <nav className="mt-6 flex items-center justify-between">
      <a href={prevDisabled ? '#' : withPage(basePath, query, page - 1)}
         className={`${linkCls} ${prevDisabled ? offCls : 'hover:border-brand hover:text-brand'}`}
         aria-disabled={prevDisabled}>
        ← {T.prev[locale] || T.prev.en}
      </a>
      <span className="text-xs text-gray-500">{T.page[locale] || T.page.en} {page}</span>
      <a href={hasNext ? withPage(basePath, query, page + 1) : '#'}
         className={`${linkCls} ${hasNext ? 'hover:border-brand hover:text-brand' : offCls}`}
         aria-disabled={!hasNext}>
        {T.next[locale] || T.next.en} →
      </a>
    </nav>
  );
}
