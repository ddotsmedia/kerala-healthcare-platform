// Physiotherapy centres directory — search + filters (specialisation, district,
// home visit). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchPhysio, SPECIALISATIONS } from '@/lib/physio';
import { listDistricts } from '@/lib/providers';
import { PhysioCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഫിസിയോതെറാപ്പി കേന്ദ്രങ്ങൾ · MalayaliDoctor' : 'Physiotherapy Centres · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ ഫിസിയോതെറാപ്പി കേന്ദ്രങ്ങൾ — ഓർത്തോ, ന്യൂറോ, സ്പോർട്സ്, ഹോം വിസിറ്റ്.' : 'Physiotherapy centres in Kerala — ortho, neuro, sports, geriatric, home visits.'
  };
}

export default async function PhysioPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', specialisation: sp.spec || '', hasHomeVisit: sp.home || '' };
  const [centres, districts] = await Promise.all([
    searchPhysio({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/physiotherapy`;
  const query = { q: sp.q, district: sp.district, spec: sp.spec, home: sp.home };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🤸 {ml ? 'ഫിസിയോതെറാപ്പി കേന്ദ്രങ്ങൾ' : 'Physiotherapy Centres'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'സ്പെഷ്യലൈസേഷൻ' : 'Specialisation'}</span>
            <select name="spec" defaultValue={sp.spec || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {SPECIALISATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="home" value="1" defaultChecked={sp.home === '1'} /> {ml ? 'ഹോം വിസിറ്റ് ലഭ്യം' : 'Home visit available'}</label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {centres.length === 0 ? <EmptyState message={ml ? 'ഫലങ്ങളൊന്നുമില്ല' : 'No physiotherapy centres found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{centres.map((p) => <PhysioCard key={p.id} centre={p} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={centres.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള ഫിസിയോതെറാപ്പിസ്റ്റിനെ സമീപിക്കുക.' : 'This information is for general awareness only. Consult a qualified physiotherapist before any treatment.'}
      </div>
    </div>
  );
}
