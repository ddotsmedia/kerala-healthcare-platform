// Blood donation registry — register as donor, see active requests, request blood.
import { resolveLocale } from '@/lib/i18n';
import { listRequests, myDonorProfile } from '@/lib/blood';
import { listDistricts } from '@/lib/providers';
import { BLOOD_GROUPS, URGENCY_LABEL } from '@/lib/bloodConstants';
import { relativeTime } from '@/lib/newsFormat';
import { DistrictFilter } from '@khp/ui';
import DonorForm from '@/components/blood/DonorForm';
import RequestForm from '@/components/blood/RequestForm';
import AvailabilityToggle from '@/components/blood/AvailabilityToggle';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const ml = resolveLocale(params.locale) === 'ml';
  return {
    title: ml ? 'രക്തദാനം · ജീവൻ രക്ഷിക്കൂ · MalayaliDoctor' : 'Blood Donation · Save Lives · MalayaliDoctor',
    description: ml ? 'രക്തദാതാവായി രജിസ്റ്റർ ചെയ്യൂ, നിങ്ങളുടെ ജില്ലയിൽ രക്തം ആവശ്യമുള്ളപ്പോൾ അറിയിപ്പ് നേടൂ.' : 'Register as a blood donor and get alerts when blood is needed in your district.'
  };
}

const BENEFITS = [
  { icon: '❤️', ml: 'ജീവൻ രക്ഷിക്കുന്നു', en: 'Saves lives' },
  { icon: '🩺', ml: 'സൗജന്യ ആരോഗ്യ പരിശോധന', en: 'Free health check' },
  { icon: '🔄', ml: 'പുതിയ രക്തകോശ ഉത്പാദനം', en: 'Renews blood cells' },
  { icon: '🤝', ml: 'സമൂഹത്തിന് സഹായം', en: 'Helps the community' }
];
const ELIGIBILITY = [
  { ml: 'പ്രായം 18–65 വയസ്സ്', en: 'Age 18–65 years' },
  { ml: 'ഭാരം 50 കി.ഗ്രാം-ന് മുകളിൽ', en: 'Weight above 50 kg' },
  { ml: 'ഹീമോഗ്ലോബിൻ 12.5 g/dL-ന് മുകളിൽ', en: 'Haemoglobin above 12.5 g/dL' },
  { ml: 'അവസാന ദാനത്തിന് ശേഷം 3 മാസം', en: '3 months since last donation' },
  { ml: 'അണുബാധയോ പനിയോ ഇല്ല', en: 'No active infection or fever' }
];

export default async function DonateBloodPage(props) {
  const sp = (await props.searchParams) || {};
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const bg = BLOOD_GROUPS.includes(sp.blood_group) ? sp.blood_group : '';
  const [requests, districts, profile] = await Promise.all([
    listRequests({ districtId: sp.district || '', bloodGroup: bg, page: 1, limit: 20 }),
    listDistricts(),
    myDonorProfile()
  ]);
  const basePath = `/${locale}/donate-blood`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <header className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 p-6 text-white">
        <h1 className="text-2xl font-bold">🩸 {ml ? 'രക്തദാനം — ജീവൻ രക്ഷിക്കൂ' : 'Blood Donation — Save Lives'}</h1>
        <p className="mt-1 text-sm text-red-50">{ml ? 'ഒരു യൂണിറ്റ് രക്തം മൂന്ന് ജീവനുകൾ വരെ രക്ഷിക്കാം.' : 'One unit of blood can save up to three lives.'}</p>
      </header>

      {/* Benefits */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.en} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <div className="text-2xl">{b.icon}</div>
            <div className="mt-1 text-xs font-medium text-gray-700">{ml ? b.ml : b.en}</div>
          </div>
        ))}
      </section>

      {/* Eligibility */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-bold text-gray-900">✅ {ml ? 'യോഗ്യതാ പട്ടിക' : 'Eligibility checklist'}</h2>
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          {ELIGIBILITY.map((e) => <li key={e.en} className="flex gap-2"><span className="text-green-600">✓</span>{ml ? e.ml : e.en}</li>)}
        </ul>
      </section>

      {/* Register */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{profile ? (ml ? 'നിങ്ങളുടെ ദാതൃ പ്രൊഫൈൽ' : 'Your donor profile') : (ml ? 'ദാതാവായി രജിസ്റ്റർ ചെയ്യുക' : 'Register as a donor')}</h2>
          {profile && <AvailabilityToggle initial={profile.is_available} locale={locale} />}
        </div>
        <DonorForm districts={districts} profile={profile} locale={locale} />
      </section>

      {/* Active requests */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">🚨 {ml ? 'നിങ്ങളുടെ പ്രദേശത്തെ അഭ്യർത്ഥനകൾ' : 'Active requests near you'}</h2>
        <form action={basePath} method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_160px_auto]">
          <DistrictFilter districts={districts} selected={sp.district || ''} locale={locale} />
          <label className="block text-sm"><span className="text-gray-700">{ml ? 'രക്തഗ്രൂപ്പ്' : 'Blood group'}</span>
            <select name="blood_group" defaultValue={bg} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">{ml ? 'എല്ലാം' : 'All'}</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select></label>
          <button className="self-end rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">{ml ? 'തിരയുക' : 'Filter'}</button>
        </form>

        {requests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{ml ? 'സജീവമായ അഭ്യർത്ഥനകളൊന്നുമില്ല' : 'No active requests'}</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const u = URGENCY_LABEL[r.urgency] || URGENCY_LABEL.normal;
              const district = ml ? r.district_ml : r.district_en;
              return (
                <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-lg font-bold text-red-700">{r.blood_group}</span>
                      <span className="ml-2 text-sm text-gray-700">× {r.units_needed} {ml ? 'യൂണിറ്റ്' : 'units'}</span>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${u.cls}`}>{ml ? u.ml : u.en}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{r.hospital_name ? `🏥 ${r.hospital_name}, ` : ''}📍 {district}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <a href={`tel:${r.contact_phone}`} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white">📞 {ml ? 'വിളിക്കുക' : 'Call'} {r.contact_phone}</a>
                    <span className="text-xs text-gray-400">{relativeTime(r.created_at, locale)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Request blood */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">{ml ? 'രക്തം ആവശ്യമുണ്ടോ?' : 'Need blood?'}</h2>
        <RequestForm districts={districts} locale={locale} />
      </section>

      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ രജിസ്ട്രി ദാതാക്കളെയും ആവശ്യക്കാരെയും ബന്ധിപ്പിക്കുന്ന ഒരു സമൂഹ സേവനമാണ് — വൈദ്യ ഉപദേശമല്ല. രക്തദാനത്തിന് മുമ്പ് യോഗ്യതയുള്ള വൈദ്യ പരിശോധന നടത്തുക. അടിയന്തരഘട്ടത്തിൽ 112 · ആംബുലൻസ് 108.' : 'This registry connects donors and those in need — it is not medical advice. Get a qualified medical screening before donating. Emergency 112 · Ambulance 108.'}
      </div>
    </div>
  );
}
