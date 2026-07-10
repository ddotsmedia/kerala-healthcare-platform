// Medical equipment suppliers directory — search + filters (category, district,
// type, rental). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchEquipment, CATEGORIES, TYPES } from '@/lib/equipment';
import { listDistricts } from '@/lib/providers';
import { EquipmentCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'മെഡിക്കൽ ഉപകരണങ്ങൾ · MalayaliDoctor' : 'Medical Equipment · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ മെഡിക്കൽ ഉപകരണ വിതരണക്കാർ & വാടക — വീൽചെയർ, ഓക്സിജൻ, CPAP, ആശുപത്രി ബെഡ്.' : 'Medical equipment suppliers & rentals in Kerala — wheelchairs, oxygen concentrators, CPAP, hospital beds.'
  };
}

export default async function MedicalEquipmentPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', type: sp.type || '', category: sp.category || '', hasRental: sp.rental || '' };
  const [suppliers, districts] = await Promise.all([
    searchEquipment({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/medical-equipment`;
  const query = { q: sp.q, district: sp.district, type: sp.type, category: sp.category, rental: sp.rental };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🦽 {ml ? 'മെഡിക്കൽ ഉപകരണങ്ങൾ' : 'Medical Equipment'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'വിതരണക്കാരൻ പേര്…' : 'Supplier name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'വിഭാഗം' : 'Category'}</span>
            <select name="category" defaultValue={sp.category || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select></label>
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'തരം' : 'Type'}</span>
            <select name="type" defaultValue={sp.type || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="rental" value="1" defaultChecked={sp.rental === '1'} /> {ml ? 'വാടക ലഭ്യം' : 'Rental available'}</label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {suppliers.length === 0 ? <EmptyState message={ml ? 'വിതരണക്കാരെ കണ്ടെത്തിയില്ല' : 'No suppliers found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{suppliers.map((e) => <EquipmentCard key={e.id} supplier={e} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={suppliers.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ഉപകരണ ലഭ്യതയും വിലയും വിതരണക്കാരനുമായി സ്ഥിരീകരിക്കുക. മെഡിക്കൽ ഉപകരണങ്ങൾ ഉപയോഗിക്കുന്നതിന് മുമ്പ് ഡോക്ടറുടെ ഉപദേശം തേടുക.' : 'This information is for general awareness only. Confirm availability and price with the supplier. Consult a doctor before using medical equipment.'}
      </div>
    </div>
  );
}
