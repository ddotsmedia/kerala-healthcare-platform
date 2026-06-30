// Clinic & diagnostic-centre listings. Minimal directory page. Verified+published.

import { resolveLocale, t } from '@/lib/i18n';
import { listFacilities } from '@/lib/providers';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'facilities')} · ${t(locale, 'site')}` };
}

const KINDS = ['clinic', 'diagnostic_centre'];

export default async function FacilitiesPage({ params, searchParams }) {
  const locale = resolveLocale(params.locale);
  const kind = (searchParams && searchParams.kind) || '';
  const facilities = await listFacilities({ kind });
  const basePath = `/${locale}/facilities`;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'facilities')}</h1>

      <nav className="flex flex-wrap gap-2">
        <a href={basePath} className={`rounded-full px-3 py-1 text-xs font-medium ${!kind ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
          {locale === 'ml' ? 'എല്ലാം' : 'All'}
        </a>
        {KINDS.map((k) => (
          <a key={k} href={`${basePath}?kind=${k}`} className={`rounded-full px-3 py-1 text-xs font-medium ${kind === k ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
            {t(locale, k)}
          </a>
        ))}
      </nav>

      {facilities.length === 0 ? (
        <EmptyState message={t(locale, 'no_results')} />
      ) : (
        <div className="grid gap-3">
          {facilities.map((f) => {
            const name = locale === 'ml' ? (f.name_ml || f.name_en) : f.name_en;
            const district = locale === 'ml' ? f.district_ml : f.district_en;
            return (
              <div key={f.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-gray-900">{name}</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t(locale, f.kind)}</span>
                </div>
                {district && <p className="mt-1 text-xs text-gray-600">{district}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
