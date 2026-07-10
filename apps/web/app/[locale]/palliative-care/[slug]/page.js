// Palliative care centre profile (SSR). Warm design. Services, coverage, contact,
// donation option. MedicalOrganization + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getPalliativeBySlug, nearbyPalliative, SERVICES } from '@/lib/palliative';
import { palliativeSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { PalliativeCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const TYPE_LABELS = {
  hospital_unit: { ml: 'ആശുപത്രി യൂണിറ്റ്', en: 'Hospital unit' }, standalone: { ml: 'സ്വതന്ത്ര കേന്ദ്രം', en: 'Standalone centre' },
  home_care: { ml: 'ഹോം കെയർ', en: 'Home care' }, ngo: { ml: 'എൻ‌ജി‌ഒ', en: 'NGO' }, hospice: { ml: 'ഹോസ്‌പിസ്', en: 'Hospice' }
};
const SERVICE_LABELS = {
  pain_management: { ml: 'വേദന നിയന്ത്രണം', en: 'Pain management' }, counselling: { ml: 'കൗൺസലിംഗ്', en: 'Counselling' },
  nursing: { ml: 'നഴ്സിംഗ്', en: 'Nursing' }, physiotherapy: { ml: 'ഫിസിയോതെറാപ്പി', en: 'Physiotherapy' },
  spiritual_care: { ml: 'ആത്മീയ പിന്തുണ', en: 'Spiritual care' }, bereavement: { ml: 'ദുഃഖ പിന്തുണ', en: 'Bereavement support' }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const p = await getPalliativeBySlug(params.slug);
  if (!p) return { title: locale === 'ml' ? 'പാലിയേറ്റീവ് കെയർ' : 'Palliative Care' };
  const name = p.name_en || p.name_ml;
  const district = p.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — palliative care services, home visits, compassionate support. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/palliative-care/${p.slug}` }
  };
}

export default async function PalliativeProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const p = await getPalliativeBySlug(params.slug);
  if (!p) notFound();

  const nearby = await nearbyPalliative(p.district_id, p.id, 3);
  const name = nm(p, ml);
  const district = ml ? p.district_ml : p.district_en;
  const address = (ml ? p.address_ml : p.address_en) || p.address_en || p.address_ml;
  const phones = Array.isArray(p.phone) ? p.phone : (p.phone ? [p.phone] : []);
  const url = `${SITE}/${locale}/palliative-care/${p.slug}`;
  const mapsQ = (p.lat != null && p.lng != null) ? `${p.lat},${p.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const services = Array.isArray(p.services) ? p.services : [];
  const coverage = Array.isArray(p.coverage_districts) ? p.coverage_districts : [];
  const type = TYPE_LABELS[p.type];

  const ld = [
    palliativeSchema(p, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'പാലിയേറ്റീവ് കെയർ' : 'Palliative Care', item: `${SITE}/${locale}/palliative-care` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-rose-600">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/palliative-care`} className="hover:text-rose-600">{ml ? 'പാലിയേറ്റീവ് കെയർ' : 'Palliative Care'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-amber-50 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-rose-900">{name}</h1>
          {p.is_free_of_cost && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">{ml ? 'സൗജന്യം' : 'Free of cost'}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
          {type && <span>{type[locale] || type.en}</span>}
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.has_home_visits && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700">🏠 {ml ? 'ഹോം വിസിറ്റ്' : 'Home visits'}</span>}
          {p.has_inpatient && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-700">{ml ? 'ഇൻപേഷ്യന്റ്' : 'Inpatient'}{p.inpatient_beds ? ` · ${p.inpatient_beds} ${ml ? 'ബെഡ്' : 'beds'}` : ''}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
        </div>
      </header>

      {/* Services */}
      <section className="rounded-2xl border border-rose-100 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവനങ്ങൾ' : 'Services'}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICES.map((s) => {
            const has = services.includes(s);
            const l = SERVICE_LABELS[s];
            return (
              <div key={s} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-gray-100 text-gray-400'}`}>
                <span>{has ? '🤍' : '—'}</span><span className="truncate">{l ? (ml ? l.ml : l.en) : s}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coverage + donation */}
      <div className="grid gap-6 sm:grid-cols-2">
        {coverage.length > 0 && (
          <section className="rounded-2xl border border-rose-100 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവന പ്രദേശം' : 'Coverage area'}</h2>
            <div className="flex flex-wrap gap-2">{coverage.map((d) => <span key={d} className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800">📍 {d}</span>)}</div>
          </section>
        )}
        {p.accepts_donations && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h2 className="mb-2 text-lg font-bold text-rose-900">🤝 {ml ? 'സംഭാവന നൽകാം' : 'Support this centre'}</h2>
            <p className="text-sm text-rose-800">{ml ? 'ഈ കേന്ദ്രം സംഭാവനകൾ സ്വീകരിക്കുന്നു. നിങ്ങളുടെ പിന്തുണ അന്തസ്സുള്ള പരിചരണം സാധ്യമാക്കുന്നു. വിശദാംശങ്ങൾക്ക് വിളിക്കുക.' : 'This centre accepts donations. Your support helps provide dignified care. Call for details on how to contribute.'}</p>
          </section>
        )}
      </div>

      {nearby.length > 0 && (
        <section className="rounded-2xl border border-rose-100 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ കേന്ദ്രങ്ങൾ' : 'Nearby centres'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <PalliativeCard key={n.id} centre={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. പരിചരണ ആവശ്യങ്ങൾക്കായി കേന്ദ്രവുമായി നേരിട്ട് ബന്ധപ്പെടുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Please contact the centre directly for care needs. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
