// Compare hospitals — side-by-side. Selection encoded in ?h=id1,id2,id3 (max 3),
// so comparisons are shareable. Add via ?q= hospital search. Server component.
import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchHospitals } from '@/lib/providers';
import { getHospitalsForCompare, parseCompareIds, MAX_COMPARE } from '@/lib/compare';
import { CompareTable, EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ആശുപത്രികൾ താരതമ്യം ചെയ്യുക · MalayaliDoctor' : 'Compare Hospitals · MalayaliDoctor',
    description: ml ? '2-3 ആശുപത്രികൾ ബെഡ്, ICU, സ്പെഷ്യാലിറ്റി, NABH, റേറ്റിംഗ് എന്നിവ ഉപയോഗിച്ച് താരതമ്യം ചെയ്യുക.' : 'Compare 2-3 Kerala hospitals side by side — beds, ICU, specialties, NABH, emergency, rating.'
  };
}

export default async function ComparePage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const basePath = `/${locale}/compare`;

  const ids = parseCompareIds(sp.h);
  const [hospitals, matches] = await Promise.all([
    getHospitalsForCompare(ids),
    sp.q ? searchHospitals({ term: sp.q, page: 1, limit: 8 }) : Promise.resolve([])
  ]);
  const selectedIds = hospitals.map((h) => h.id);
  const hrefWith = (list) => `${basePath}?h=${list.join(',')}`;
  const canAddMore = selectedIds.length < MAX_COMPARE;
  const nm = (h) => (ml ? h.name_ml : h.name_en) || h.name_en;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">⚖️ {ml ? 'ആശുപത്രികൾ താരതമ്യം ചെയ്യുക' : 'Compare Hospitals'}</h1>
      <p className="text-sm text-gray-600">{ml ? `പരമാവധി ${MAX_COMPARE} ആശുപത്രികൾ. ഈ പേജിന്റെ URL പങ്കിടാം.` : `Compare up to ${MAX_COMPARE} hospitals. Share this page's URL to share the comparison.`}</p>

      {/* Add hospital search */}
      <form action={basePath} method="get" className="rounded-xl border border-gray-200 bg-white p-4">
        {selectedIds.length > 0 && <input type="hidden" name="h" value={selectedIds.join(',')} />}
        <label className="block text-sm font-medium text-gray-700">{ml ? 'ആശുപത്രി ചേർക്കുക' : 'Add a hospital'}</label>
        <div className="mt-1 flex gap-2">
          <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'ആശുപത്രി പേര്…' : 'Hospital name…'} disabled={!canAddMore}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100" />
          <button type="submit" disabled={!canAddMore} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{ml ? 'തിരയുക' : 'Search'}</button>
        </div>
        {!canAddMore && <p className="mt-2 text-xs text-amber-700">{ml ? `പരമാവധി ${MAX_COMPARE} ആശുപത്രികൾ എത്തി.` : `Maximum ${MAX_COMPARE} hospitals reached.`}</p>}
        {sp.q && canAddMore && (
          <ul className="mt-3 divide-y divide-gray-100">
            {matches.filter((m) => !selectedIds.includes(m.id)).length === 0 ? (
              <li className="py-2 text-sm text-gray-500">{ml ? 'പൊരുത്തമില്ല' : 'No matches'}</li>
            ) : matches.filter((m) => !selectedIds.includes(m.id)).map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-800">{nm(m)}<span className="ml-2 text-xs text-gray-400">{ml ? m.district_ml : m.district_en}</span></span>
                <Link href={hrefWith([...selectedIds, m.id])} className="rounded-lg border border-brand px-2.5 py-1 text-xs font-medium text-brand hover:bg-teal-50">+ {ml ? 'ചേർക്കുക' : 'Add'}</Link>
              </li>
            ))}
          </ul>
        )}
      </form>

      {hospitals.length === 0 ? (
        <EmptyState message={ml ? 'താരതമ്യം ചെയ്യാൻ ആശുപത്രികൾ ചേർക്കുക' : 'Add hospitals to start comparing'} />
      ) : (
        <>
          {/* Selected chips w/ remove */}
          <div className="flex flex-wrap items-center gap-2">
            {hospitals.map((h) => (
              <span key={h.id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {nm(h)}
                <Link href={hrefWith(selectedIds.filter((x) => x !== h.id))} aria-label="remove" className="text-gray-400 hover:text-red-600">✕</Link>
              </span>
            ))}
          </div>

          <CompareTable hospitals={hospitals} locale={locale} />
        </>
      )}
    </div>
  );
}
