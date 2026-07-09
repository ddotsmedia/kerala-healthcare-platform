// Eye centres directory — search + filters (surgery, district, type, optical,
// low-vision, pediatric ophthalmology). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchEyeCentres, SURGERIES } from '@/lib/eyeCentres';
import { listDistricts } from '@/lib/providers';
import { EyeCentreCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;
const TYPES = ['hospital', 'clinic', 'optical_shop'];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'നേത്ര ആശുപത്രികൾ · MalayaliDoctor' : 'Eye Hospitals · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ നേത്ര ആശുപത്രികൾ — തിമിര ശസ്ത്രക്രിയ, ലാസിക്, റെറ്റിന, ഒപ്റ്റിക്കൽ.' : 'Eye hospitals in Kerala — cataract surgery, LASIK, retina care, optical shops.'
  };
}

export default async function EyeHospitalsPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = {
    term: sp.q || '', districtId: sp.district || '', type: sp.type || '', surgery: sp.surgery || '',
    hasOptical: sp.optical || '', hasLowVision: sp.lowvision || '', hasPediatric: sp.pediatric || ''
  };
  const [centres, districts] = await Promise.all([
    searchEyeCentres({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/eye-hospitals`;
  const query = { q: sp.q, district: sp.district, type: sp.type, surgery: sp.surgery, optical: sp.optical, lowvision: sp.lowvision, pediatric: sp.pediatric };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">👁️ {ml ? 'നേത്ര ആശുപത്രികൾ' : 'Eye Hospitals'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'തരം' : 'Type'}</span>
            <select name="type" defaultValue={sp.type || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select></label>
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'ശസ്ത്രക്രിയ' : 'Surgery'}</span>
            <select name="surgery" defaultValue={sp.surgery || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {SURGERIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="optical" value="1" defaultChecked={sp.optical === '1'} /> {ml ? 'ഒപ്റ്റിക്കൽ ഷോപ്പ്' : 'Optical shop'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="lowvision" value="1" defaultChecked={sp.lowvision === '1'} /> {ml ? 'ലോ വിഷൻ' : 'Low vision'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="pediatric" value="1" defaultChecked={sp.pediatric === '1'} /> {ml ? 'ശിശു നേത്രം' : 'Pediatric'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {centres.length === 0 ? <EmptyState message={ml ? 'ഫലങ്ങളൊന്നുമില്ല' : 'No eye centres found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{centres.map((e) => <EyeCentreCard key={e.id} centre={e} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={centres.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള നേത്രരോഗ വിദഗ്ധനെ സമീപിക്കുക.' : 'This information is for general awareness only. Consult a qualified ophthalmologist before any treatment.'}
      </div>
    </div>
  );
}
