// Dental clinics directory — search + filters (treatment, district, implants,
// orthodontics, pediatric). Server component.
import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchDental, TREATMENTS } from '@/lib/dental';
import { listDistricts } from '@/lib/providers';
import { districtSlug } from '@/lib/landing';
import { DentalCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'ഡെന്റൽ ക്ലിനിക്കുകൾ · MalayaliDoctor' : 'Dental Clinics · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ ഡെന്റൽ ക്ലിനിക്കുകൾ — റൂട്ട് കനാൽ, ഇംപ്ലാന്റ്, ബ്രേസസ്, ശിശു ദന്തചികിത്സ.' : 'Dental clinics in Kerala — root canal, implants, braces, pediatric dentistry.'
  };
}

export default async function DentalPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = {
    term: sp.q || '', districtId: sp.district || '', treatment: sp.treatment || '',
    hasImplants: sp.implants || '', hasOrthodontics: sp.ortho || '', hasPediatric: sp.pediatric || ''
  };
  const [clinics, districts] = await Promise.all([
    searchDental({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/dental`;
  const query = { q: sp.q, district: sp.district, treatment: sp.treatment, implants: sp.implants, ortho: sp.ortho, pediatric: sp.pediatric };
  const inp = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">🦷 {ml ? 'ഡെന്റൽ ക്ലിനിക്കുകൾ' : 'Dental Clinics'}</h1>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'ക്ലിനിക് പേര്…' : 'Clinic name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'ചികിത്സ' : 'Treatment'}</span>
            <select name="treatment" defaultValue={sp.treatment || ''} className={inp}>
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>
              {TREATMENTS.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select></label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="implants" value="1" defaultChecked={sp.implants === '1'} /> {ml ? 'ഇംപ്ലാന്റ്' : 'Implants'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ortho" value="1" defaultChecked={sp.ortho === '1'} /> {ml ? 'ഓർത്തോഡോണ്ടിക്സ്' : 'Orthodontics'}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="pediatric" value="1" defaultChecked={sp.pediatric === '1'} /> {ml ? 'ശിശു ദന്ത' : 'Pediatric'}</label>
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {clinics.length === 0 ? <EmptyState message={ml ? 'ഫലങ്ങളൊന്നുമില്ല' : 'No clinics found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{clinics.map((c) => <DentalCard key={c.id} clinic={c} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={clinics.length === LIMIT} locale={locale} />
        </>
      )}

      {/* District SEO links */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'ജില്ല അനുസരിച്ച് ദന്തഡോക്ടർമാർ' : 'Dentists by district'}</h2>
        <div className="flex flex-wrap gap-2">
          {districts.map((d) => (
            <Link key={d.id} href={`${basePath}/district/${districtSlug(d.name_en)}`}
              className="rounded-full border border-brand px-3 py-1 text-xs font-medium text-brand hover:bg-teal-50">
              {ml ? d.name_ml : d.name_en}
            </Link>
          ))}
        </div>
      </section>

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള ദന്തഡോക്ടറെ സമീപിക്കുക.' : 'This information is for general awareness only. Consult a qualified dentist before any treatment.'}
      </div>
    </div>
  );
}
