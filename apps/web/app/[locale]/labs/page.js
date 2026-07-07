// Diagnostic labs directory — search + filters (NABL, home collection, district,
// test category, open now). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchLabs } from '@/lib/labs';
import { listDistricts } from '@/lib/providers';
import { LabCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;
const CATEGORIES = ['hematology', 'biochemistry', 'microbiology', 'radiology', 'pathology', 'serology', 'histopathology'];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഡയഗ്നോസ്റ്റിക് ലാബുകൾ · MalayaliDoctor' : 'Diagnostic Labs · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ NABL ലാബുകൾ, രക്തപരിശോധന, ഹോം കളക്ഷൻ.' : 'Find NABL diagnostic labs in Kerala — blood tests, scans, home collection.'
  };
}

export default async function LabsPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = {
    term: sp.q || '', districtId: sp.district || '', nabl: sp.nabl || '',
    homeCollection: sp.home || '', testCategory: sp.category || '', openNow: sp.open || ''
  };
  const [labs, districts] = await Promise.all([
    searchLabs({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/labs`;
  const query = { q: sp.q, district: sp.district, nabl: sp.nabl, home: sp.home, category: sp.category, open: sp.open };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🧪 {ml ? 'ഡയഗ്നോസ്റ്റിക് ലാബുകൾ' : 'Diagnostic Labs'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'ലാബ് അല്ലെങ്കിൽ ടെസ്റ്റ് പേര്…' : 'Lab or test name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'ടെസ്റ്റ് വിഭാഗം' : 'Test category'}</span>
            <select name="category" defaultValue={sp.category || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
            </select></label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="nabl" value="1" defaultChecked={sp.nabl === '1'} /> {ml ? 'NABL അക്രഡിറ്റഡ്' : 'NABL accredited'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="home" value="1" defaultChecked={sp.home === '1'} /> {ml ? 'ഹോം കളക്ഷൻ' : 'Home collection'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="open" value="1" defaultChecked={sp.open === '1'} /> {ml ? 'ഇപ്പോൾ തുറന്നത്' : 'Open now'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {labs.length === 0 ? <EmptyState message={ml ? 'ഫലങ്ങളൊന്നുമില്ല' : 'No labs found'} /> : (
        <>
          <div className="grid gap-3">{labs.map((l) => <LabCard key={l.id} lab={l} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={labs.length === LIMIT} locale={locale} />
        </>
      )}
    </div>
  );
}
