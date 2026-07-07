// Diagnostic lab profile (SSR). MedicalOrganization + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getLabBySlug, nearbyLabs } from '@/lib/labs';
import { labSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { LabCard } from '@khp/ui';
import TestsTable from '@/components/labs/TestsTable';

export const dynamic = 'force-dynamic';

const DAYS = [['mon', 'Mon', 'തിങ്കൾ'], ['tue', 'Tue', 'ചൊവ്വ'], ['wed', 'Wed', 'ബുധൻ'], ['thu', 'Thu', 'വ്യാഴം'], ['fri', 'Fri', 'വെള്ളി'], ['sat', 'Sat', 'ശനി'], ['sun', 'Sun', 'ഞായർ']];
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const lab = await getLabBySlug(params.slug);
  if (!lab) return { title: locale === 'ml' ? 'ലാബുകൾ' : 'Labs' };
  const name = lab.name_en || lab.name_ml;
  const district = lab.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — ${lab.is_nabl_accredited ? 'NABL accredited. ' : ''}Tests, prices, home collection. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/labs/${lab.slug}` }
  };
}

export default async function LabProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const lab = await getLabBySlug(params.slug);
  if (!lab) notFound();

  const nearby = (await nearbyLabs(lab.district_id, lab.id, 3));
  const name = nm(lab, ml);
  const district = ml ? lab.district_ml : lab.district_en;
  const address = (ml ? lab.address_ml : lab.address_en) || lab.address_en || lab.address_ml;
  const phones = Array.isArray(lab.phone) ? lab.phone : (lab.phone ? [lab.phone] : []);
  const url = `${SITE}/${locale}/labs/${lab.slug}`;
  const mapsQ = (lab.lat != null && lab.lng != null) ? `${lab.lat},${lab.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const hours = lab.operating_hours || {};

  const ld = [
    labSchema(lab, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ലാബുകൾ' : 'Labs', item: `${SITE}/${locale}/labs` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/labs`} className="hover:text-brand">{ml ? 'ലാബുകൾ' : 'Labs'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      {/* Header */}
      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {lab.is_nabl_accredited && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">NABL{lab.nabl_cert_number ? ` · ${lab.nabl_cert_number}` : ''}</span>}
          {lab.open_now === true && <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{ml ? 'ഇപ്പോൾ തുറന്നത്' : 'Open now'}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {lab.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(lab.rating_avg).toFixed(1)} ({lab.rating_count})</span>}
          <span>{ml ? 'റിപ്പോർട്ട്' : 'Report'}: {lab.report_delivery_hours}h</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {lab.home_collection && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-brand">🏠 {ml ? 'ഹോം കളക്ഷൻ' : 'Home collection'}{lab.home_collection_fee_inr != null ? ` · ₹${lab.home_collection_fee_inr}` : ''}</span>}
          {lab.online_reports && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">📄 {ml ? 'ഓൺലൈൻ റിപ്പോർട്ട്' : 'Online reports'}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
        </div>
      </header>

      {/* Tests */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ലഭ്യമായ ടെസ്റ്റുകൾ' : 'Tests offered'}</h2>
        <TestsTable tests={lab.tests || []} locale={locale} />
      </section>

      {/* Hours + How to book */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'പ്രവർത്തന സമയം' : 'Operating hours'}</h2>
          {Object.keys(hours).length ? (
            <ul className="space-y-1 text-sm">
              {DAYS.map(([k, en, mlD]) => (
                <li key={k} className="flex justify-between"><span className="text-gray-600">{ml ? mlD : en}</span>
                  <span className="text-gray-900">{hours[k] && hours[k].open ? `${hours[k].open} – ${hours[k].close}` : (ml ? 'അടച്ചു' : 'Closed')}</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">{ml ? 'ലഭ്യമല്ല' : 'Not available'}</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'എങ്ങനെ ബുക്ക് ചെയ്യാം' : 'How to book'}</h2>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>📞 {ml ? `വിളിക്കുക: ${phones[0] || '—'}` : `Call: ${phones[0] || '—'}`}</li>
            <li>🚶 {ml ? 'ലാബിൽ നേരിട്ട് പോകുക (വാക്ക്-ഇൻ)' : 'Walk in to the lab'}</li>
            {lab.home_collection && <li>🏠 {ml ? 'ഹോം സാമ്പിൾ കളക്ഷൻ അഭ്യർത്ഥിക്കുക' : 'Request home sample collection'}</li>}
            {lab.online_reports && <li>📄 {ml ? 'ഓൺലൈനായി റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക' : 'Download reports online'}</li>}
          </ol>
        </section>
      </div>

      {/* Nearby */}
      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ലാബുകൾ' : 'Nearby labs'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <LabCard key={n.id} lab={n} locale={locale} />)}</div>
        </section>
      )}

      {/* Disclaimer (non-dismissable) */}
      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ടെസ്റ്റ് വിലയും ലഭ്യതയും സ്ഥിരീകരിക്കാൻ ലാബുമായി നേരിട്ട് ബന്ധപ്പെടുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Confirm test prices and availability directly with the lab. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
