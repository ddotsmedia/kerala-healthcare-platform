// Ambulance providers — emergency-first: hardcoded govt numbers above the fold,
// then private list (all, no pagination). Server component, no-JS GET form.
import { resolveLocale } from '@/lib/i18n';
import { searchAmbulance, AMBULANCE_TYPES } from '@/lib/ambulance';
import { listDistricts } from '@/lib/providers';
import { AmbulanceCard, EmptyState, DistrictFilter } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ആംബുലൻസ് സേവനങ്ങൾ · MalayaliDoctor' : 'Ambulance Services · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ സർക്കാർ (108) & സ്വകാര്യ ആംബുലൻസ് സേവനങ്ങൾ — ICU, NICU, ബേസിക്.' : 'Government (108) & private ambulance services in Kerala — ICU, NICU, basic.'
  };
}

export default async function AmbulancePage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';

  const [providers, districts] = await Promise.all([
    searchAmbulance({ term: sp.q || '', districtId: sp.district || '', type: sp.type || '' }),
    listDistricts()
  ]);
  const basePath = `/${locale}/ambulance`;
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="-my-6">
      {/* Government numbers — always above the fold */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-red-600 py-8 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-2xl font-extrabold sm:text-3xl">🚑 {ml ? 'ആംബുലൻസ് വേണോ?' : 'Need an ambulance?'}</h1>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a href="tel:108" className="rounded-xl bg-white px-4 py-3 text-red-600">
              <div className="text-2xl font-extrabold">108</div>
              <div className="text-xs font-semibold">{ml ? 'സൗജന്യ സർക്കാർ ആംബുലൻസ് (കേരള)' : 'Free government ambulance (Kerala)'}</div>
            </a>
            <a href="tel:112" className="rounded-xl border-2 border-white px-4 py-3 text-white">
              <div className="text-2xl font-extrabold">112</div>
              <div className="text-xs font-semibold">{ml ? 'ദേശീയ അടിയന്തരം' : 'National emergency'}</div>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <h2 className="text-lg font-bold text-gray-900">{ml ? 'സ്വകാര്യ ആംബുലൻസ് സേവനങ്ങൾ' : 'Private ambulance services'}</h2>

        <form action={basePath} method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
          <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'ആംബുലൻസ് തരം' : 'Ambulance type'}</span>
            <select name="type" defaultValue={sp.type || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {AMBULANCE_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select></label>
          <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark sm:col-span-3">{ml ? 'തിരയുക' : 'Search'}</button>
        </form>

        {providers.length === 0 ? <EmptyState message={ml ? 'ആംബുലൻസ് സേവനങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No ambulance services found'} /> : (
          <>
            <p className="text-sm text-gray-500">{providers.length} {ml ? 'സേവനങ്ങൾ' : 'providers'}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{providers.map((a) => <AmbulanceCard key={a.id} provider={a} locale={locale} />)}</div>
          </>
        )}

        <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          {ml ? 'ജീവന് ഭീഷണിയുള്ള അടിയന്തരഘട്ടത്തിൽ ആദ്യം 108 അല്ലെങ്കിൽ 112 വിളിക്കുക. സ്വകാര്യ നിരക്കുകൾ മാറാവുന്നതാണ് — വിളിച്ച് സ്ഥിരീകരിക്കുക.' : 'In a life-threatening emergency call 108 or 112 first. Private fares may vary — confirm by phone.'}
        </div>
      </div>
    </div>
  );
}
