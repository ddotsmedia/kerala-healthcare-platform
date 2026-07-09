// Ambulance provider profile (SSR). Call Now primary CTA. EmergencyService +
// BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getAmbulanceBySlug, nearbyAmbulance } from '@/lib/ambulance';
import { ambulanceSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { AmbulanceCard, AmbulanceTypeBadges } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const a = await getAmbulanceBySlug(params.slug);
  if (!a) return { title: locale === 'ml' ? 'ആംബുലൻസ്' : 'Ambulance' };
  const name = a.name_en || a.name_ml;
  const district = a.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — ${a.is_24hr ? '24-hour ambulance. ' : ''}Call now. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/ambulance/${a.slug}` }
  };
}

const EQUIP = [
  ['has_oxygen', { ml: 'ഓക്സിജൻ', en: 'Oxygen' }],
  ['has_ventilator', { ml: 'വെന്റിലേറ്റർ', en: 'Ventilator' }],
  ['has_cardiac_monitor', { ml: 'കാർഡിയാക് മോണിറ്റർ', en: 'Cardiac monitor' }],
  ['has_trained_paramedic', { ml: 'പരിശീലിത പാരാമെഡിക്', en: 'Trained paramedic' }]
];

export default async function AmbulanceProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const a = await getAmbulanceBySlug(params.slug);
  if (!a) notFound();

  const nearby = await nearbyAmbulance(a.district_id, a.id, 3);
  const name = nm(a, ml);
  const district = ml ? a.district_ml : a.district_en;
  const address = (ml ? a.address_ml : a.address_en) || a.address_en || a.address_ml;
  const phones = Array.isArray(a.phone) ? a.phone : (a.phone ? [a.phone] : []);
  const callNum = phones[0];
  const url = `${SITE}/${locale}/ambulance/${a.slug}`;
  const coverage = Array.isArray(a.coverage_districts) ? a.coverage_districts : [];
  const equipment = EQUIP.filter(([k]) => a[k]);

  const ld = [
    ambulanceSchema(a, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ആംബുലൻസ്' : 'Ambulance', item: `${SITE}/${locale}/ambulance` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/ambulance`} className="hover:text-brand">{ml ? 'ആംബുലൻസ്' : 'Ambulance'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {a.is_24hr && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">24h</span>}
        </div>
        <div className="mt-1 text-sm text-gray-600">{district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}</div>
        <div className="mt-2"><AmbulanceTypeBadges types={a.ambulance_types} /></div>

        {callNum && (
          <a href={`tel:${callNum}`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-lg font-extrabold text-white hover:bg-red-700">
            📞 {ml ? 'ഇപ്പോൾ വിളിക്കുക' : 'Call Now'} — {callNum}
          </a>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm">
          {phones[1] && <a href={`tel:${phones[1]}`} className="font-semibold text-brand">{phones[1]}</a>}
          {a.whatsapp_number && <a href={`https://wa.me/${a.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600">💬 WhatsApp</a>}
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഉപകരണങ്ങൾ' : 'Equipment'}</h2>
          {equipment.length ? <ul className="space-y-2 text-sm text-gray-700">{equipment.map(([k, l]) => <li key={k}>✅ {ml ? l.ml : l.en}</li>)}</ul>
            : <p className="text-sm text-gray-500">{ml ? 'വിവരം ലഭ്യമല്ല' : 'Not specified'}</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'നിരക്ക് & കവറേജ്' : 'Fares & coverage'}</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {a.base_fare_inr != null && <li>{ml ? 'അടിസ്ഥാന നിരക്ക്' : 'Base fare'}: ₹{a.base_fare_inr}</li>}
            {a.per_km_fare_inr != null && <li>{ml ? 'കി.മീ നിരക്ക്' : 'Per km'}: ₹{a.per_km_fare_inr}</li>}
            {a.base_fare_inr == null && a.per_km_fare_inr == null && <li className="text-gray-500">{ml ? 'നിരക്ക് വിളിച്ച് ചോദിക്കുക' : 'Ask for fare by phone'}</li>}
            {coverage.length > 0 && <li>{ml ? 'കവറേജ്' : 'Coverage'}: {coverage.join(', ')}</li>}
          </ul>
        </section>
      </div>

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ആംബുലൻസ് സേവനങ്ങൾ' : 'Nearby ambulance services'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <AmbulanceCard key={n.id} provider={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ജീവന് ഭീഷണിയുള്ള അടിയന്തരഘട്ടത്തിൽ ആദ്യം 108 / 112 വിളിക്കുക. നിരക്കുകൾ മാറാവുന്നതാണ് — വിളിച്ച് സ്ഥിരീകരിക്കുക.' : 'In a life-threatening emergency call 108 / 112 first. Fares may vary — confirm by phone.'}
      </div>
    </article>
  );
}
