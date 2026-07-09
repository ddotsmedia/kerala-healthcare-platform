// Dental clinic profile (SSR). Dentist + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getDentalBySlug, nearbyDental, TREATMENTS } from '@/lib/dental';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { dentalSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { DentalCard, DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const TREAT_LABELS = {
  cleaning: { ml: 'ക്ലീനിംഗ്', en: 'Cleaning' }, filling: { ml: 'ഫില്ലിംഗ്', en: 'Filling' },
  root_canal: { ml: 'റൂട്ട് കനാൽ', en: 'Root canal' }, implant: { ml: 'ഇംപ്ലാന്റ്', en: 'Implant' },
  braces: { ml: 'ബ്രേസസ്', en: 'Braces' }, whitening: { ml: 'വൈറ്റനിംഗ്', en: 'Whitening' },
  extraction: { ml: 'എക്സ്ട്രാക്ഷൻ', en: 'Extraction' }, pediatric: { ml: 'ശിശു ദന്ത', en: 'Pediatric' },
  orthodontics: { ml: 'ഓർത്തോഡോണ്ടിക്സ്', en: 'Orthodontics' }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const c = await getDentalBySlug(params.slug);
  if (!c) return { title: locale === 'ml' ? 'ഡെന്റൽ' : 'Dental' };
  const name = c.name_en || c.name_ml;
  const district = c.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — dental treatments, dentists, fees. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/dental/${c.slug}` }
  };
}

export default async function DentalProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const c = await getDentalBySlug(params.slug);
  if (!c) notFound();

  const dentistry = await getSpecialtyBySlug('dentistry');
  const [nearby, dentists] = await Promise.all([
    nearbyDental(c.district_id, c.id, 3),
    dentistry ? searchDoctors({ specialtyId: dentistry.id, districtId: c.district_id, page: 1, limit: 6 }) : Promise.resolve([])
  ]);

  const name = nm(c, ml);
  const district = ml ? c.district_ml : c.district_en;
  const address = (ml ? c.address_ml : c.address_en) || c.address_en || c.address_ml;
  const phones = Array.isArray(c.phone) ? c.phone : (c.phone ? [c.phone] : []);
  const url = `${SITE}/${locale}/dental/${c.slug}`;
  const mapsQ = (c.lat != null && c.lng != null) ? `${c.lat},${c.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const offered = Array.isArray(c.treatments_offered) ? c.treatments_offered : [];

  const ld = [
    dentalSchema(c, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഡെന്റൽ' : 'Dental', item: `${SITE}/${locale}/dental` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/dental`} className="hover:text-brand">{ml ? 'ഡെന്റൽ' : 'Dental'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {c.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})</span>}
          {c.consultation_fee_inr != null && <span>₹{c.consultation_fee_inr} {ml ? 'കൺസൾട്ടേഷൻ' : 'consultation'}</span>}
          {c.sterilisation_standard && <span className="text-green-700">🧼 {c.sterilisation_standard}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
          {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">🌐 {ml ? 'വെബ്‌സൈറ്റ്' : 'Website'}</a>}
        </div>
      </header>

      {/* Treatments grid */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ചികിത്സകൾ' : 'Treatments offered'}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TREATMENTS.map((t) => {
            const has = offered.includes(t);
            const l = TREAT_LABELS[t];
            return (
              <div key={t} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-teal-200 bg-teal-50 text-brand' : 'border-gray-100 text-gray-400'}`}>
                <span>{has ? '✅' : '—'}</span><span className="truncate">{l ? (ml ? l.ml : l.en) : t}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dentists */}
      {dentists.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? `${district}-ലെ ദന്തഡോക്ടർമാർ` : `Dentists in ${district}`}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{dentists.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}</div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ഡെന്റൽ ക്ലിനിക്കുകൾ' : 'Nearby dental clinics'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <DentalCard key={n.id} clinic={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള ദന്തഡോക്ടറെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Consult a qualified dentist before any treatment. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
