// Blood banks directory — emergency design: red hero, ALL results (no pagination),
// prominent phones. Server component, no-JS GET form.
import { resolveLocale } from '@/lib/i18n';
import { searchBloodBanks, BLOOD_TYPES } from '@/lib/bloodBanks';
import { listDistricts } from '@/lib/providers';
import { BloodBankCard, EmptyState, DistrictFilter } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ബ്ലഡ് ബാങ്കുകൾ · MalayaliDoctor' : 'Blood Banks · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ ബ്ലഡ് ബാങ്കുകൾ — രക്തഗ്രൂപ്പ് ലഭ്യത, 24 മണിക്കൂർ, അടിയന്തര നമ്പറുകൾ.' : 'Blood banks in Kerala — blood type availability, 24-hour, emergency numbers.'
  };
}

export default async function BloodBanksPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';

  const [banks, districts] = await Promise.all([
    searchBloodBanks({ term: sp.q || '', districtId: sp.district || '', bloodType: sp.blood_type || '', is24hr: sp.h24 || '' }),
    listDistricts()
  ]);
  const basePath = `/${locale}/blood-banks`;
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="-my-6">
      {/* Emergency hero — always visible */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-red-600 py-8 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-2xl font-extrabold sm:text-3xl">🩸 {ml ? 'അടിയന്തരമായി രക്തം വേണോ?' : 'Need blood urgently?'}</h1>
          <p className="mt-1 text-base font-semibold">{ml ? 'ബ്ലഡ് ബാങ്കിലേക്ക് നേരിട്ട് വിളിക്കുക' : 'Call a blood bank directly'}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <a href="tel:108" className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-600">🚑 {ml ? 'ആംബുലൻസ്' : 'Ambulance'} 108</a>
            <a href="tel:112" className="rounded-lg border-2 border-white px-4 py-2 text-sm font-bold text-white">📞 112</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <form action={basePath} method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-1" />
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'രക്തഗ്രൂപ്പ്' : 'Blood type'}</span>
            <select name="blood_type" defaultValue={sp.blood_type || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select></label>
          <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" name="h24" value="1" defaultChecked={sp.h24 === '1'} /> {ml ? '24 മണിക്കൂർ' : '24-hour'}</label>
          <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark sm:col-span-2 lg:col-span-4">{ml ? 'തിരയുക' : 'Search'}</button>
        </form>

        {banks.length === 0 ? <EmptyState message={ml ? 'ബ്ലഡ് ബാങ്കുകളൊന്നും കണ്ടെത്തിയില്ല' : 'No blood banks found'} /> : (
          <>
            <p className="text-sm text-gray-500">{banks.length} {ml ? 'ബ്ലഡ് ബാങ്കുകൾ' : 'blood banks'}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{banks.map((b) => <BloodBankCard key={b.id} bank={b} locale={locale} />)}</div>
          </>
        )}

        <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          {ml ? 'രക്തലഭ്യത മാറാവുന്നതാണ് — പോകുന്നതിന് മുമ്പ് ബ്ലഡ് ബാങ്കിൽ വിളിച്ച് സ്ഥിരീകരിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'Blood availability changes constantly — call the blood bank to confirm before travelling. In an emergency call 112 / Ambulance 108.'}
        </div>
      </div>
    </div>
  );
}
