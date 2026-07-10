// Home nursing agencies directory — search + filters (district, service, nurse
// gender, qualification). Server component.
import { resolveLocale } from '@/lib/i18n';
import { searchHomeNursing, SERVICES, QUALIFICATIONS } from '@/lib/homeNursing';
import { listDistricts } from '@/lib/providers';
import { HomeNursingCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഹോം നഴ്സിംഗ് ഏജൻസികൾ · MalayaliDoctor' : 'Home Nursing Agencies · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ ഹോം നഴ്സിംഗ് ഏജൻസികൾ — വയോജന പരിചരണം, ICU കെയർ, ശസ്ത്രക്രിയാനന്തര പരിചരണം.' : 'Home nursing agencies in Kerala — elderly care, ICU care, post-surgical nursing, baby care.'
  };
}

export default async function HomeNursingPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', service: sp.service || '', gender: sp.gender || '', qualification: sp.qual || '' };
  const [agencies, districts] = await Promise.all([
    searchHomeNursing({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/home-nursing`;
  const query = { q: sp.q, district: sp.district, service: sp.service, gender: sp.gender, qual: sp.qual };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🧑‍⚕️ {ml ? 'ഹോം നഴ്സിംഗ് ഏജൻസികൾ' : 'Home Nursing Agencies'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'ഏജൻസി പേര്…' : 'Agency name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'സേവനം' : 'Service'}</span>
            <select name="service" defaultValue={sp.service || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {SERVICES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select></label>
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'യോഗ്യത' : 'Qualification'}</span>
            <select name="qual" defaultValue={sp.qual || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q.replace(/_/g, ' ')}</option>)}
            </select></label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-gray-700">{ml ? 'നഴ്സ്:' : 'Nurse:'}</span>
          <label className="flex items-center gap-2"><input type="radio" name="gender" value="" defaultChecked={!sp.gender} /> {ml ? 'ഏതെങ്കിലും' : 'Any'}</label>
          <label className="flex items-center gap-2"><input type="radio" name="gender" value="female" defaultChecked={sp.gender === 'female'} /> {ml ? 'വനിതാ' : 'Female'}</label>
          <label className="flex items-center gap-2"><input type="radio" name="gender" value="male" defaultChecked={sp.gender === 'male'} /> {ml ? 'പുരുഷ' : 'Male'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {agencies.length === 0 ? <EmptyState message={ml ? 'ഏജൻസികളൊന്നും കണ്ടെത്തിയില്ല' : 'No agencies found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{agencies.map((a) => <HomeNursingCard key={a.id} agency={a} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={agencies.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. നിരക്കുകളും ലഭ്യതയും ഏജൻസിയുമായി സ്ഥിരീകരിക്കുക.' : 'This information is for general awareness only. Confirm rates and availability directly with the agency.'}
      </div>
    </div>
  );
}
