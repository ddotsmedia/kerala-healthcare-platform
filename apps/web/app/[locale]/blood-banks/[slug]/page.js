// Blood bank profile (SSR). Emergency phone prominent, Call Now primary CTA.
// MedicalOrganization + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getBloodBankBySlug, nearbyBloodBanks, BLOOD_TYPES } from '@/lib/bloodBanks';
import { bloodBankSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { BloodBankCard, BloodTypeBadges } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const b = await getBloodBankBySlug(params.slug);
  if (!b) return { title: locale === 'ml' ? 'ബ്ലഡ് ബാങ്കുകൾ' : 'Blood Banks' };
  const name = b.name_en || b.name_ml;
  const district = b.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — ${b.is_24hr ? '24-hour blood bank. ' : ''}Blood availability, emergency contact. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/blood-banks/${b.slug}` }
  };
}

export default async function BloodBankProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const b = await getBloodBankBySlug(params.slug);
  if (!b) notFound();

  const nearby = await nearbyBloodBanks(b.district_id, b.id, 3);
  const name = nm(b, ml);
  const district = ml ? b.district_ml : b.district_en;
  const address = (ml ? b.address_ml : b.address_en) || b.address_en || b.address_ml;
  const phones = Array.isArray(b.phone) ? b.phone : (b.phone ? [b.phone] : []);
  const callNum = b.emergency_phone || phones[0];
  const url = `${SITE}/${locale}/blood-banks/${b.slug}`;
  const mapsQ = (b.lat != null && b.lng != null) ? `${b.lat},${b.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const available = Array.isArray(b.blood_types_available) ? b.blood_types_available : [];

  const ld = [
    bloodBankSchema(b, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ബ്ലഡ് ബാങ്കുകൾ' : 'Blood Banks', item: `${SITE}/${locale}/blood-banks` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/blood-banks`} className="hover:text-brand">{ml ? 'ബ്ലഡ് ബാങ്കുകൾ' : 'Blood Banks'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      {/* Header + Call Now CTA */}
      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {b.is_24hr && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">24h</span>}
          {b.open_now === true && <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{ml ? 'തുറന്നത്' : 'Open now'}</span>}
        </div>
        {b.hospital_slug && <p className="mt-1 text-sm text-gray-600">{ml ? 'ആശുപത്രി' : 'Part of'}: <Link href={`/${locale}/hospitals/${b.hospital_slug}`} className="text-brand">{ml ? (b.hospital_name_ml || b.hospital_name_en) : b.hospital_name_en}</Link></p>}
        <div className="mt-2 text-sm text-gray-600">{district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}{b.license_number && <span> · {ml ? 'ലൈസൻസ്' : 'Lic'}: {b.license_number}</span>}</div>

        {callNum && (
          <a href={`tel:${callNum}`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-lg font-extrabold text-white hover:bg-red-700">
            📞 {ml ? 'ഇപ്പോൾ വിളിക്കുക' : 'Call Now'} — {callNum}
          </a>
        )}
        {b.emergency_phone && phones[0] && b.emergency_phone !== phones[0] && (
          <p className="mt-2 text-center text-sm text-gray-600">{ml ? 'മറ്റ് നമ്പർ' : 'Other'}: <a href={`tel:${phones[0]}`} className="font-semibold text-brand">{phones[0]}</a></p>
        )}
        <div className="mt-3 text-center">
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand hover:underline">🗺️ {ml ? 'വഴി കാണിക്കുക →' : 'Directions →'}</a>
        </div>
      </header>

      {/* Blood types grid */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ലഭ്യമായ രക്തഗ്രൂപ്പുകൾ' : 'Blood types available'}</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {BLOOD_TYPES.map((t) => {
            const has = available.includes(t);
            return (
              <div key={t} className={`flex flex-col items-center rounded-lg border py-3 ${has ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                <span className={`text-lg font-extrabold ${has ? 'text-red-600' : 'text-gray-400'}`}>{t}</span>
                <span className="text-[10px] text-gray-500">{has ? (ml ? 'ലഭ്യം' : 'Available') : (ml ? 'ഇല്ല' : 'N/A')}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-amber-700">{ml ? '⚠️ ലഭ്യത മാറാം — വിളിച്ച് സ്ഥിരീകരിക്കുക.' : '⚠️ Availability changes — call to confirm.'}</p>
      </section>

      {/* Services */}
      {(b.has_apheresis || b.has_component_separation) && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സൗകര്യങ്ങൾ' : 'Facilities'}</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {b.has_apheresis && <li>🩸 {ml ? 'അഫെറെസിസ്' : 'Apheresis'}</li>}
            {b.has_component_separation && <li>🧪 {ml ? 'ഘടക വേർതിരിക്കൽ' : 'Component separation'}</li>}
          </ul>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ബ്ലഡ് ബാങ്കുകൾ' : 'Nearby blood banks'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <BloodBankCard key={n.id} bank={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. രക്തലഭ്യത പോകുന്നതിന് മുമ്പ് ഫോണിൽ സ്ഥിരീകരിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Confirm blood availability by phone before travelling. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
