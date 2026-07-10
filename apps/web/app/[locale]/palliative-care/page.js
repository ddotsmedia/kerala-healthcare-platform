// Palliative care directory — warm, dignity-focused design (rose/amber, not the
// clinical teal). Type tabs, district + home-visit filter. Server component.
import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchPalliative } from '@/lib/palliative';
import { listDistricts } from '@/lib/providers';
import { PalliativeCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

const TYPE_TABS = [
  ['', { ml: 'എല്ലാം', en: 'All' }],
  ['hospital_unit', { ml: 'ആശുപത്രി യൂണിറ്റ്', en: 'Hospital Unit' }],
  ['home_care', { ml: 'ഹോം കെയർ', en: 'Home Care' }],
  ['ngo', { ml: 'എൻ‌ജി‌ഒ', en: 'NGO' }],
  ['hospice', { ml: 'ഹോസ്‌പിസ്', en: 'Hospice' }]
];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'പാലിയേറ്റീവ് കെയർ · MalayaliDoctor' : 'Palliative Care · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ പാലിയേറ്റീവ് കെയർ, ഹോം കെയർ, ഹോസ്‌പിസ് കേന്ദ്രങ്ങൾ — അന്തസ്സോടെയുള്ള പരിചരണം.' : 'Palliative care, home care and hospice centres in Kerala — compassionate, dignified care.'
  };
}

export default async function PalliativeCarePage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', type: sp.type || '', hasHomeVisits: sp.home || '' };
  const [centres, districts] = await Promise.all([
    searchPalliative({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/palliative-care`;
  const query = { q: sp.q, district: sp.district, type: sp.type, home: sp.home };
  const typeLink = (t) => `${basePath}?${new URLSearchParams({ ...Object.fromEntries(Object.entries({ ...query, type: t }).filter(([, v]) => v)) }).toString()}`;

  return (
    <div className="space-y-5">
      {/* Warm intro banner */}
      <section className="rounded-2xl bg-gradient-to-br from-rose-100 to-amber-50 p-6">
        <h1 className="text-2xl font-bold text-rose-900">🕊️ {ml ? 'പാലിയേറ്റീവ് കെയർ' : 'Palliative Care'}</h1>
        <p className="mt-2 text-sm leading-relaxed text-rose-800">
          {ml ? 'ഗുരുതരമായ അസുഖ സമയത്ത് അന്തസ്സും ആശ്വാസവും നൽകുന്ന പരിചരണം. കേരളത്തിന്റെ പാലിയേറ്റീവ് കെയർ ശൃംഖല ഇന്ത്യയിലെ ഏറ്റവും മികച്ചതാണ് — നിങ്ങൾ ഒറ്റയ്ക്കല്ല.' : 'Care that brings comfort and dignity through serious illness. Kerala has one of India’s finest palliative care networks — you are not alone.'}
        </p>
      </section>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map(([t, l]) => (
          <Link key={t || 'all'} href={t ? typeLink(t) : basePath}
            className={`rounded-full px-3 py-1 text-sm font-medium ${(sp.type || '') === t ? 'bg-rose-600 text-white' : 'border border-rose-200 bg-white text-rose-700 hover:border-rose-400'}`}>
            {ml ? l.ml : l.en}
          </Link>
        ))}
      </div>

      <form action={basePath} method="get" className="space-y-3 rounded-2xl border border-rose-100 bg-white p-4">
        {sp.type && <input type="hidden" name="type" value={sp.type} />}
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-rose-400 focus:outline-none" />
        <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="home" value="1" defaultChecked={sp.home === '1'} /> {ml ? 'ഹോം വിസിറ്റ് ലഭ്യം' : 'Home visits available'}</label>
        <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {centres.length === 0 ? <EmptyState message={ml ? 'കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No palliative care centres found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{centres.map((p) => <PalliativeCard key={p.id} centre={p} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={centres.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. പരിചരണ ആവശ്യങ്ങൾക്കായി കേന്ദ്രവുമായി നേരിട്ട് ബന്ധപ്പെടുക.' : 'This information is for general awareness only. Please contact the centre directly for care needs.'}
      </div>
    </div>
  );
}
