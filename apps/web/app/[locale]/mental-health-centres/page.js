// Mental health centres directory — crisis banner (non-dismissable), type tabs,
// service filter. Compassionate, non-stigmatising. Server component.
import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchMentalHealth, TYPES } from '@/lib/mentalHealth';
import { listDistricts } from '@/lib/providers';
import { MentalHealthCentreCard, EmptyState, DistrictFilter, Pagination } from '@khp/ui';
import CrisisBanner from '@/components/mentalhealth/CrisisBanner';

export const dynamic = 'force-dynamic';
const LIMIT = 20;

const TYPE_TABS = [
  ['', { ml: 'എല്ലാം', en: 'All' }],
  ['hospital', { ml: 'സൈക്യാട്രി', en: 'Psychiatry' }],
  ['clinic', { ml: 'ക്ലിനിക്ക്', en: 'Clinic' }],
  ['counselling', { ml: 'കൗൺസലിംഗ്', en: 'Counselling' }],
  ['deaddiction', { ml: 'ഡീ-അഡിക്ഷൻ', en: 'De-addiction' }],
  ['rehab', { ml: 'പുനരധിവാസം', en: 'Rehabilitation' }]
];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'മാനസികാരോഗ്യ കേന്ദ്രങ്ങൾ · MalayaliDoctor' : 'Mental Health Centres · MalayaliDoctor',
    description: ml ? 'കേരളത്തിലെ മാനസികാരോഗ്യ, സൈക്യാട്രി, കൗൺസലിംഗ്, ഡീ-അഡിക്ഷൻ, പുനരധിവാസ കേന്ദ്രങ്ങൾ.' : 'Psychiatry, counselling, de-addiction and rehabilitation centres in Kerala. Confidential help.'
  };
}

export default async function MentalHealthCentresPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const filters = { term: sp.q || '', districtId: sp.district || '', type: sp.type || '', service: sp.service || '', hasEmergency: sp.emergency || '' };
  const [centres, districts] = await Promise.all([
    searchMentalHealth({ ...filters, page, limit: LIMIT }), listDistricts()
  ]);
  const basePath = `/${locale}/mental-health-centres`;
  const query = { q: sp.q, district: sp.district, type: sp.type, service: sp.service, emergency: sp.emergency };
  const typeLink = (t) => `${basePath}?${new URLSearchParams({ ...Object.fromEntries(Object.entries({ ...query, type: t }).filter(([, v]) => v)) }).toString()}`;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">💙 {ml ? 'മാനസികാരോഗ്യ കേന്ദ്രങ്ങൾ' : 'Mental Health Centres'}</h1>

      <CrisisBanner locale={locale} />

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map(([t, l]) => (
          <Link key={t || 'all'} href={t ? typeLink(t) : basePath}
            className={`rounded-full px-3 py-1 text-sm font-medium ${(sp.type || '') === t ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700 hover:border-brand'}`}>
            {ml ? l.ml : l.en}
          </Link>
        ))}
      </div>

      <form action={basePath} method="get" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        {sp.type && <input type="hidden" name="type" value={sp.type} />}
        <input type="search" name="q" defaultValue={sp.q || ''} placeholder={ml ? 'പേര്…' : 'Name…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
        <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="emergency" value="1" defaultChecked={sp.emergency === '1'} /> {ml ? '24x7 അടിയന്തര പിന്തുണ' : '24x7 emergency support'}</label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{ml ? 'തിരയുക' : 'Search'}</button>
      </form>

      {centres.length === 0 ? <EmptyState message={ml ? 'കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No centres found'} /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">{centres.map((m) => <MentalHealthCentreCard key={m.id} centre={m} locale={locale} />)}</div>
          <Pagination basePath={basePath} query={query} page={page} hasNext={centres.length === LIMIT} locale={locale} />
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'മാനസികാരോഗ്യ പ്രശ്നങ്ങൾ ചികിത്സിക്കാവുന്നതാണ്, സഹായം തേടുന്നത് കരുത്തിന്റെ അടയാളമാണ്. ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം — യോഗ്യതയുള്ള മാനസികാരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക.' : 'Mental health conditions are treatable, and seeking help is a sign of strength. This information is for general awareness only — please consult a qualified mental health professional.'}
      </div>
    </div>
  );
}
