// SearchBar.js — GET form, no client JS required. Submits ?q= to the list page.

import { t } from '@/lib/i18n';

export default function SearchBar({ locale, action, defaultValue }) {
  return (
    <form action={action} method="get" className="flex w-full gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue || ''}
        placeholder={t(locale, 'search_placeholder')}
        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
      >
        {t(locale, 'search')}
      </button>
    </form>
  );
}
