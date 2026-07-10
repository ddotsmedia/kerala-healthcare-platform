// Dialysis centres directory — search + filters (district, HD/PD, govt scheme,
// shift). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchDialysis, SHIFTS } from '@/lib/dialysis';
import { listDistricts } from '@/lib/providers';
import { DialysisCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഡയാലിസിസ് കേന്ദ്രങ്ങൾ · MalayaliDoctor' : 'Dialysis Centres · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ ഡയാലിസിസ് കേന്ദ്രങ്ങൾ — മെഷീനുകൾ, ഷിഫ്റ്റ് സമയം, സർക്കാർ പദ്ധതി (PMJAY).' : 'Dialysis centres in Kerala — machine count, shift timings, government scheme (PMJAY).'
  };
}

export default async function DialysisPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', hasHd: sp.hd || '', hasPd: sp.pd || '', acceptsGovt: sp.govt || '', shift: sp.shift || '' };
  const [centres, districts] = await Promise.all([
    searchDialysis({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/dialysis`;
  const query = { q: sp.q, district: sp.district, hd: sp.hd, pd: sp.pd, govt: sp.govt, shift: sp.shift };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🩺 {ml ? 'ഡയാലിസിസ് കേന്ദ്രങ്ങൾ' : 'Dialysis Centres'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'ഷിഫ്റ്റ്' : 'Shift'}</span>
            <select name="shift" defaultValue={sp.shift || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="hd" value="1" defaultChecked={sp.hd === '1'} /> {ml ? 'ഹീമോഡയാലിസിസ് (HD)' : 'Hemodialysis (HD)'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="pd" value="1" defaultChecked={sp.pd === '1'} /> {ml ? 'പെരിറ്റോണിയൽ (PD)' : 'Peritoneal (PD)'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="govt" value="1" defaultChecked={sp.govt === '1'} /> {ml ? 'സർക്കാർ പദ്ധതി' : 'Govt scheme'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {centres.length === 0 ? <EmptyState message={ml ? 'കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No dialysis centres found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{centres.map((c) => <DialysisCard key={c.id} centre={c} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={centres.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'സ്ലോട്ട് ലഭ്യതയും സമയവും മാറാവുന്നതാണ് — പോകുന്നതിന് മുമ്പ് കേന്ദ്രത്തിൽ വിളിച്ച് സ്ഥിരീകരിക്കുക. ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം.' : 'Slot availability and timings change — call the centre to confirm before travelling. This information is for general awareness only.'}
      </div>
    </div>
  );
}
