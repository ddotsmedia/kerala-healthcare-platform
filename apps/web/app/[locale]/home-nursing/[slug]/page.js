// Home nursing agency profile (SSR). Services grid, rates, coverage, qualifications,
// "Request a nurse" CTA. MedicalBusiness + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getHomeNursingBySlug, nearbyHomeNursing, SERVICES } from '@/lib/homeNursing';
import { homeNursingSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { HomeNursingCard } from '@khp/ui';
import RequestNurseButton from '@/components/nursing/RequestNurseButton';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const SERVICE_LABELS = {
  general_nursing: { ml: 'ജനറൽ നഴ്സിംഗ്', en: 'General nursing' }, icu_care: { ml: 'ICU കെയർ', en: 'ICU care' },
  post_surgical: { ml: 'ശസ്ത്രക്രിയാനന്തരം', en: 'Post-surgical' }, elderly_care: { ml: 'വയോജന പരിചരണം', en: 'Elderly care' },
  baby_care: { ml: 'ശിശു പരിചരണം', en: 'Baby care' }, physiotherapy: { ml: 'ഫിസിയോതെറാപ്പി', en: 'Physiotherapy' },
  wound_care: { ml: 'മുറിവ് പരിചരണം', en: 'Wound care' }, palliative: { ml: 'പാലിയേറ്റീവ്', en: 'Palliative' }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const a = await getHomeNursingBySlug(params.slug);
  if (!a) return { title: locale === 'ml' ? 'ഹോം നഴ്സിംഗ്' : 'Home Nursing' };
  const name = a.name_en || a.name_ml;
  const district = a.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — home nursing services, rates, coverage. Request a nurse on MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/home-nursing/${a.slug}` }
  };
}

export default async function HomeNursingProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const a = await getHomeNursingBySlug(params.slug);
  if (!a) notFound();

  const nearby = await nearbyHomeNursing(a.district_id, a.id, 3);
  const name = nm(a, ml);
  const district = ml ? a.district_ml : a.district_en;
  const address = (ml ? a.address_ml : a.address_en) || a.address_en || a.address_ml;
  const phones = Array.isArray(a.phone) ? a.phone : (a.phone ? [a.phone] : []);
  const url = `${SITE}/${locale}/home-nursing/${a.slug}`;
  const services = Array.isArray(a.services) ? a.services : [];
  const coverage = Array.isArray(a.coverage_districts) ? a.coverage_districts : [];
  const rates = [
    a.hourly_rate_inr != null && { l: ml ? 'മണിക്കൂർ' : 'Hourly', v: `₹${a.hourly_rate_inr}` },
    a.daily_rate_inr != null && { l: ml ? 'ദിവസം' : 'Daily', v: `₹${Number(a.daily_rate_inr).toLocaleString('en-IN')}` },
    a.monthly_rate_inr != null && { l: ml ? 'മാസം' : 'Monthly', v: `₹${Number(a.monthly_rate_inr).toLocaleString('en-IN')}` }
  ].filter(Boolean);

  const ld = [
    homeNursingSchema(a, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഹോം നഴ്സിംഗ്' : 'Home Nursing', item: `${SITE}/${locale}/home-nursing` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/home-nursing`} className="hover:text-brand">{ml ? 'ഹോം നഴ്സിംഗ്' : 'Home Nursing'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {a.is_registered && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{ml ? 'രജിസ്റ്റേഡ്' : 'Registered'}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {a.nurse_qualification && <span>🎓 {a.nurse_qualification}</span>}
          {a.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(a.rating_avg).toFixed(1)} ({a.rating_count})</span>}
          <span>{ml ? 'കുറഞ്ഞ ബുക്കിംഗ്' : 'Min booking'}: {a.minimum_booking_hours}h</span>
        </div>
        <div className="mt-2 text-sm text-gray-600">{[a.has_female_nurses && (ml ? 'വനിതാ നഴ്സുമാർ' : 'Female nurses'), a.has_male_nurses && (ml ? 'പുരുഷ നഴ്സുമാർ' : 'Male nurses')].filter(Boolean).join(' · ')}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <RequestNurseButton agencyName={a.name_en || a.name_ml} locale={locale} />
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Services */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവനങ്ങൾ' : 'Services'}</h2>
          <div className="grid grid-cols-1 gap-2">
            {SERVICES.map((s) => {
              const has = services.includes(s);
              const l = SERVICE_LABELS[s];
              return (
                <div key={s} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-teal-200 bg-teal-50 text-brand' : 'border-gray-100 text-gray-400'}`}>
                  <span>{has ? '✅' : '—'}</span><span>{l ? (ml ? l.ml : l.en) : s}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          {/* Rates */}
          {rates.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'നിരക്കുകൾ' : 'Rates'}</h2>
              <ul className="space-y-2 text-sm">
                {rates.map((r, i) => <li key={i} className="flex justify-between"><span className="text-gray-600">{r.l}</span><span className="font-semibold text-gray-900">{r.v}</span></li>)}
              </ul>
              <p className="mt-2 text-xs text-gray-400">{ml ? 'നിരക്കുകൾ സൂചകമാണ് — ഏജൻസിയുമായി സ്ഥിരീകരിക്കുക.' : 'Rates are indicative — confirm with the agency.'}</p>
            </section>
          )}
          {/* Coverage */}
          {coverage.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവന പ്രദേശം' : 'Coverage area'}</h2>
              <div className="flex flex-wrap gap-2">{coverage.map((d) => <span key={d} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">📍 {d}</span>)}</div>
            </section>
          )}
        </div>
      </div>

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ഏജൻസികൾ' : 'Nearby agencies'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <HomeNursingCard key={n.id} agency={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. നിരക്കുകളും ലഭ്യതയും ഏജൻസിയുമായി സ്ഥിരീകരിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Confirm rates and availability directly with the agency. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
