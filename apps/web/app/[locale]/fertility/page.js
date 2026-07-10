// Fertility centres directory — search + filters (treatment, district, sperm
// bank, egg donation). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchFertility, TREATMENTS } from '@/lib/fertility';
import { listDistricts } from '@/lib/providers';
import { FertilityCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഫെർട്ടിലിറ്റി കേന്ദ്രങ്ങൾ · MalayaliDoctor' : 'Fertility Centres · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ IVF/IUI ഫെർട്ടിലിറ്റി കേന്ദ്രങ്ങൾ — ചികിത്സകൾ, വിജയ നിരക്ക്.' : 'IVF/IUI fertility centres in Kerala — treatments, success rates, specialists.'
  };
}

export default async function FertilityPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', treatment: sp.treatment || '', hasSpermBank: sp.sperm || '', hasEggDonation: sp.egg || '' };
  const [centres, districts] = await Promise.all([
    searchFertility({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/fertility`;
  const query = { q: sp.q, district: sp.district, treatment: sp.treatment, sperm: sp.sperm, egg: sp.egg };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🌱 {ml ? 'ഫെർട്ടിലിറ്റി കേന്ദ്രങ്ങൾ' : 'Fertility Centres'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'ചികിത്സ' : 'Treatment'}</span>
            <select name="treatment" defaultValue={sp.treatment || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {TREATMENTS.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select></label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sperm" value="1" defaultChecked={sp.sperm === '1'} /> {ml ? 'സ്‌പേം ബാങ്ക്' : 'Sperm bank'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="egg" value="1" defaultChecked={sp.egg === '1'} /> {ml ? 'എഗ് ഡൊണേഷൻ' : 'Egg donation'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {centres.length === 0 ? <EmptyState message={ml ? 'കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No fertility centres found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{centres.map((f) => <FertilityCard key={f.id} centre={f} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={centres.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'വിജയ നിരക്കുകൾ സ്വയം റിപ്പോർട്ട് ചെയ്തതും ഓരോ കേസിനും വ്യത്യാസപ്പെടുന്നതുമാണ്. ഒരു വിദഗ്ധനെ സമീപിക്കുക.' : 'Success rates are self-reported and vary by individual case. Consult a specialist.'}
      </div>
    </div>
  );
}
