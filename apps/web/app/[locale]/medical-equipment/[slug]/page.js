// Medical equipment supplier profile (SSR). Categories, services, contact.
// MedicalBusiness + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getEquipmentBySlug, nearbyEquipment, CATEGORIES } from '@/lib/equipment';
import { equipmentSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { EquipmentCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const TYPE_LABELS = { supplier: { ml: 'വിതരണക്കാരൻ', en: 'Supplier' }, rental: { ml: 'വാടക', en: 'Rental' }, repair: { ml: 'റിപ്പയർ', en: 'Repair' } };
const CAT_LABELS = {
  mobility: { ml: 'മൊബിലിറ്റി', en: 'Mobility' }, respiratory: { ml: 'ശ്വസനം', en: 'Respiratory' },
  monitoring: { ml: 'മോണിറ്ററിംഗ്', en: 'Monitoring' }, rehabilitation: { ml: 'പുനരധിവാസം', en: 'Rehabilitation' },
  hospital_furniture: { ml: 'ആശുപത്രി ഫർണിച്ചർ', en: 'Hospital furniture' }, orthotics: { ml: 'ഓർത്തോട്ടിക്സ്', en: 'Orthotics' },
  prosthetics: { ml: 'പ്രോസ്തെറ്റിക്സ്', en: 'Prosthetics' }
};
const SERVICES = [
  ['has_rental', { ml: 'വാടക', en: 'Rental' }], ['has_delivery', { ml: 'വീട്ടിലേക്ക് ഡെലിവറി', en: 'Home delivery' }],
  ['has_installation', { ml: 'ഇൻസ്റ്റാളേഷൻ', en: 'Installation' }], ['has_repair_service', { ml: 'റിപ്പയർ സേവനം', en: 'Repair service' }]
];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const e = await getEquipmentBySlug(params.slug);
  if (!e) return { title: locale === 'ml' ? 'മെഡിക്കൽ ഉപകരണങ്ങൾ' : 'Medical Equipment' };
  const name = e.name_en || e.name_ml;
  const district = e.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — medical equipment${e.has_rental ? ', rental' : ''}, delivery. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/medical-equipment/${e.slug}` }
  };
}

export default async function EquipmentProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const e = await getEquipmentBySlug(params.slug);
  if (!e) notFound();

  const nearby = await nearbyEquipment(e.district_id, e.id, 3);
  const name = nm(e, ml);
  const district = ml ? e.district_ml : e.district_en;
  const address = (ml ? e.address_ml : e.address_en) || e.address_en || e.address_ml;
  const phones = Array.isArray(e.phone) ? e.phone : (e.phone ? [e.phone] : []);
  const url = `${SITE}/${locale}/medical-equipment/${e.slug}`;
  const mapsQ = encodeURIComponent(`${name} ${district || ''} Kerala`);
  const cats = Array.isArray(e.equipment_categories) ? e.equipment_categories : [];
  const type = TYPE_LABELS[e.type];
  const services = SERVICES.filter(([k]) => e[k]);

  const ld = [
    equipmentSchema(e, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'മെഡിക്കൽ ഉപകരണങ്ങൾ' : 'Medical Equipment', item: `${SITE}/${locale}/medical-equipment` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/medical-equipment`} className="hover:text-brand">{ml ? 'മെഡിക്കൽ ഉപകരണങ്ങൾ' : 'Medical Equipment'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {type && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{type[locale] || type.en}</span>}
        </div>
        <div className="mt-2 text-sm text-gray-600">{district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
          {e.website && <a href={e.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">🌐 {ml ? 'വെബ്‌സൈറ്റ്' : 'Website'}</a>}
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Categories */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഉപകരണ വിഭാഗങ്ങൾ' : 'Equipment categories'}</h2>
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES.map((c) => {
              const has = cats.includes(c);
              const l = CAT_LABELS[c];
              return (
                <div key={c} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-teal-200 bg-teal-50 text-brand' : 'border-gray-100 text-gray-400'}`}>
                  <span>{has ? '✅' : '—'}</span><span>{l ? (ml ? l.ml : l.en) : c}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Services */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവനങ്ങൾ' : 'Services'}</h2>
          {services.length ? <ul className="space-y-2 text-sm text-gray-700">{services.map(([k, l]) => <li key={k}>✅ {ml ? l.ml : l.en}</li>)}</ul>
            : <p className="text-sm text-gray-500">{ml ? 'വിവരം ലഭ്യമല്ല' : 'Not specified'}</p>}
        </section>
      </div>

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ വിതരണക്കാർ' : 'Nearby suppliers'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <EquipmentCard key={n.id} supplier={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ഉപകരണ ലഭ്യതയും വിലയും വിതരണക്കാരനുമായി സ്ഥിരീകരിക്കുക. മെഡിക്കൽ ഉപകരണങ്ങൾ ഉപയോഗിക്കുന്നതിന് മുമ്പ് ഡോക്ടറുടെ ഉപദേശം തേടുക.' : 'This information is for general awareness only. Confirm availability and price with the supplier. Consult a doctor before using medical equipment.'}
      </div>
    </article>
  );
}
