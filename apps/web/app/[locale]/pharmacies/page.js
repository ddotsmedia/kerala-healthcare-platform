// Pharmacy directory — search + filters (24hr, delivery, generic, district, open now).
import { resolveLocale } from '@/lib/i18n';
import { searchPharmacies } from '@/lib/pharmacies';
import { listDistricts } from '@/lib/providers';
import { PharmacyCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഫാർമസികൾ · MalayaliDoctor' : 'Pharmacies · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ 24-മണിക്കൂർ ഫാർമസികൾ, മരുന്ന് ഡെലിവറി, ജനറിക് മെഡിസിൻ.' : '24-hour pharmacies, medicine delivery, generic medicine shops in Kerala.'
  };
}

export default async function PharmaciesPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = {
    term: sp.q || '', districtId: sp.district || '', is24hr: sp.h24 || '',
    hasDelivery: sp.delivery || '', sellsGeneric: sp.generic || '', openNow: sp.open || ''
  };
  const [pharmacies, districts] = await Promise.all([
    searchPharmacies({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/pharmacies`;
  const query = { q: sp.q, district: sp.district, h24: sp.h24, delivery: sp.delivery, generic: sp.generic, open: sp.open };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">💊 {ml ? 'ഫാർമസികൾ' : 'Pharmacies'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'ഫാർമസി പേര്…' : 'Pharmacy name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="h24" value="1" defaultChecked={sp.h24 === '1'} /> {ml ? '24 മണിക്കൂർ' : '24-hour'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="delivery" value="1" defaultChecked={sp.delivery === '1'} /> {ml ? 'ഡെലിവറി' : 'Delivery'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="generic" value="1" defaultChecked={sp.generic === '1'} /> {ml ? 'ജനറിക്' : 'Generic'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="open" value="1" defaultChecked={sp.open === '1'} /> {ml ? 'ഇപ്പോൾ തുറന്നത്' : 'Open now'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {pharmacies.length === 0 ? <EmptyState message={ml ? 'ഫലങ്ങളൊന്നുമില്ല' : 'No pharmacies found'} /> : (
        <>
          <div className="grid gap-3">{pharmacies.map((p) => <PharmacyCard key={p.id} pharmacy={p} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={pharmacies.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഏതെങ്കിലും മരുന്ന് കഴിക്കുന്നതിന് മുമ്പ് എപ്പോഴും ഒരു ഡോക്ടറെ സമീപിക്കുക. കുറിപ്പടി മരുന്നുകൾ സ്വയം കഴിക്കരുത്.' : 'Always consult a doctor before taking any medication. Never self-medicate with prescription drugs.'}
      </div>
    </div>
  );
}
