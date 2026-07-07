// Pharmacy profile (SSR). Pharmacy + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getPharmacyBySlug, nearbyPharmacies } from '@/lib/pharmacies';
import { pharmacySchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { PharmacyCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

const DAYS = [['mon', 'Mon', 'തിങ്കൾ'], ['tue', 'Tue', 'ചൊവ്വ'], ['wed', 'Wed', 'ബുധൻ'], ['thu', 'Thu', 'വ്യാഴം'], ['fri', 'Fri', 'വെള്ളി'], ['sat', 'Sat', 'ശനി'], ['sun', 'Sun', 'ഞായർ']];
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ph = await getPharmacyBySlug(params.slug);
  if (!ph) return { title: locale === 'ml' ? 'ഫാർമസികൾ' : 'Pharmacies' };
  const name = ph.name_en || ph.name_ml;
  const district = ph.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — ${ph.is_24hr ? '24-hour. ' : ''}${ph.has_delivery ? 'Home delivery. ' : ''}Pharmacy on MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/pharmacies/${ph.slug}` }
  };
}

export default async function PharmacyProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const ph = await getPharmacyBySlug(params.slug);
  if (!ph) notFound();

  const nearby = await nearbyPharmacies(ph.district_id, ph.id, 3);
  const name = nm(ph, ml);
  const district = ml ? ph.district_ml : ph.district_en;
  const address = (ml ? ph.address_ml : ph.address_en) || ph.address_en || ph.address_ml;
  const phones = Array.isArray(ph.phone) ? ph.phone : (ph.phone ? [ph.phone] : []);
  const url = `${SITE}/${locale}/pharmacies/${ph.slug}`;
  const mapsQ = (ph.lat != null && ph.lng != null) ? `${ph.lat},${ph.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const hours = ph.operating_hours || {};

  const services = [
    ph.has_delivery && (ml ? '🛵 വീട്ടിലേക്ക് ഡെലിവറി' : '🛵 Home delivery'),
    ph.sells_generic && (ml ? '💊 ജനറിക് മരുന്നുകൾ' : '💊 Generic medicines'),
    ph.has_cold_storage && (ml ? '❄️ കോൾഡ് സ്റ്റോറേജ് (വാക്സിൻ/ഇൻസുലിൻ)' : '❄️ Cold storage (vaccines/insulin)'),
    ph.is_24hr && (ml ? '🕒 24 മണിക്കൂർ സേവനം' : '🕒 24-hour service')
  ].filter(Boolean);

  const ld = [
    pharmacySchema(ph, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഫാർമസികൾ' : 'Pharmacies', item: `${SITE}/${locale}/pharmacies` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/pharmacies`} className="hover:text-brand">{ml ? 'ഫാർമസികൾ' : 'Pharmacies'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {ph.is_24hr && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">24h</span>}
          {ph.open_now === true && <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{ml ? 'ഇപ്പോൾ തുറന്നത്' : 'Open now'}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {ph.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(ph.rating_avg).toFixed(1)} ({ph.rating_count})</span>}
          {ph.has_delivery && ph.delivery_radius_km != null && <span>{ml ? 'ഡെലിവറി' : 'Delivery'}: {ph.delivery_radius_km}km</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവനങ്ങൾ' : 'Services'}</h2>
          {services.length ? <ul className="space-y-2 text-sm text-gray-700">{services.map((s, i) => <li key={i}>{s}</li>)}</ul>
            : <p className="text-sm text-gray-500">{ml ? 'ലഭ്യമല്ല' : 'Not available'}</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'പ്രവർത്തന സമയം' : 'Operating hours'}</h2>
          {ph.is_24hr ? <p className="text-sm font-medium text-green-700">{ml ? 'എല്ലാ ദിവസവും 24 മണിക്കൂറും തുറന്നിരിക്കും' : 'Open 24 hours, all days'}</p>
            : Object.keys(hours).length ? (
              <ul className="space-y-1 text-sm">
                {DAYS.map(([k, en, mlD]) => (
                  <li key={k} className="flex justify-between"><span className="text-gray-600">{ml ? mlD : en}</span>
                    <span className="text-gray-900">{hours[k] && hours[k].open ? `${hours[k].open} – ${hours[k].close}` : (ml ? 'അടച്ചു' : 'Closed')}</span></li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500">{ml ? 'ലഭ്യമല്ല' : 'Not available'}</p>}
        </section>
      </div>

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ഫാർമസികൾ' : 'Nearby pharmacies'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <PharmacyCard key={n.id} pharmacy={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഏതെങ്കിലും മരുന്ന് കഴിക്കുന്നതിന് മുമ്പ് എപ്പോഴും ഒരു ഡോക്ടറെ സമീപിക്കുക. കുറിപ്പടി മരുന്നുകൾ സ്വയം കഴിക്കരുത്. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'Always consult a doctor before taking any medication. Never self-medicate with prescription drugs. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
