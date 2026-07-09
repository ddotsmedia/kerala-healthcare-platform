// Eye centre profile (SSR). Surgeries grid, equipment, linked ophthalmologists.
// MedicalOrganization + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getEyeCentreBySlug, nearbyEyeCentres, SURGERIES, EQUIPMENT } from '@/lib/eyeCentres';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { eyeCentreSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { EyeCentreCard, DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const SURG_LABELS = {
  cataract: { ml: 'തിമിരം', en: 'Cataract' }, lasik: { ml: 'ലാസിക്', en: 'LASIK' },
  glaucoma: { ml: 'ഗ്ലോക്കോമ', en: 'Glaucoma' }, retina: { ml: 'റെറ്റിന', en: 'Retina' },
  cornea: { ml: 'കോർണിയ', en: 'Cornea' }, squint: { ml: 'കോങ്കണ്ണ്', en: 'Squint' }
};
const EQUIP_LABELS = {
  oct: 'OCT', slit_lamp: { ml: 'സ്ലിറ്റ് ലാമ്പ്', en: 'Slit lamp' },
  field_analyser: { ml: 'ഫീൽഡ് അനലൈസർ', en: 'Field analyser' }, fundus_camera: { ml: 'ഫണ്ടസ് ക്യാമറ', en: 'Fundus camera' }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const e = await getEyeCentreBySlug(params.slug);
  if (!e) return { title: locale === 'ml' ? 'നേത്ര ആശുപത്രികൾ' : 'Eye Hospitals' };
  const name = e.name_en || e.name_ml;
  const district = e.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — eye surgeries, equipment, ophthalmologists. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/eye-hospitals/${e.slug}` }
  };
}

export default async function EyeCentreProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const e = await getEyeCentreBySlug(params.slug);
  if (!e) notFound();

  const ophthalmology = await getSpecialtyBySlug('ophthalmology');
  const [nearby, doctors] = await Promise.all([
    nearbyEyeCentres(e.district_id, e.id, 3),
    ophthalmology ? searchDoctors({ specialtyId: ophthalmology.id, districtId: e.district_id, page: 1, limit: 6 }) : Promise.resolve([])
  ]);

  const name = nm(e, ml);
  const district = ml ? e.district_ml : e.district_en;
  const address = (ml ? e.address_ml : e.address_en) || e.address_en || e.address_ml;
  const phones = Array.isArray(e.phone) ? e.phone : (e.phone ? [e.phone] : []);
  const url = `${SITE}/${locale}/eye-hospitals/${e.slug}`;
  const mapsQ = (e.lat != null && e.lng != null) ? `${e.lat},${e.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const surgeries = Array.isArray(e.surgeries_offered) ? e.surgeries_offered : [];
  const equip = Array.isArray(e.equipment) ? e.equipment : [];
  const eqLabel = (k) => { const l = EQUIP_LABELS[k]; return typeof l === 'string' ? l : (l ? (ml ? l.ml : l.en) : k); };

  const ld = [
    eyeCentreSchema(e, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'നേത്ര ആശുപത്രികൾ' : 'Eye Hospitals', item: `${SITE}/${locale}/eye-hospitals` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/eye-hospitals`} className="hover:text-brand">{ml ? 'നേത്ര ആശുപത്രികൾ' : 'Eye Hospitals'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {e.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(e.rating_avg).toFixed(1)} ({e.rating_count})</span>}
          {e.consultation_fee_inr != null && <span>₹{e.consultation_fee_inr} {ml ? 'കൺസൾട്ടേഷൻ' : 'consultation'}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {e.has_optical_shop && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-brand">👓 {ml ? 'ഒപ്റ്റിക്കൽ ഷോപ്പ്' : 'Optical shop'}</span>}
          {e.has_low_vision_clinic && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{ml ? 'ലോ വിഷൻ ക്ലിനിക്' : 'Low vision clinic'}</span>}
          {e.has_pediatric_ophthalmology && <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">{ml ? 'ശിശു നേത്രം' : 'Pediatric ophthalmology'}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
          {e.website && <a href={e.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">🌐 {ml ? 'വെബ്‌സൈറ്റ്' : 'Website'}</a>}
        </div>
      </header>

      {/* Surgeries grid */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ശസ്ത്രക്രിയകൾ' : 'Surgeries offered'}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SURGERIES.map((s) => {
            const has = surgeries.includes(s);
            const l = SURG_LABELS[s];
            return (
              <div key={s} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-teal-200 bg-teal-50 text-brand' : 'border-gray-100 text-gray-400'}`}>
                <span>{has ? '✅' : '—'}</span><span className="truncate">{l ? (ml ? l.ml : l.en) : s}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Equipment */}
      {equip.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഉപകരണങ്ങൾ' : 'Equipment'}</h2>
          <div className="flex flex-wrap gap-2">{equip.map((k) => <span key={k} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">🔬 {eqLabel(k)}</span>)}</div>
        </section>
      )}

      {/* Ophthalmologists */}
      {doctors.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? `${district}-ലെ നേത്രരോഗ വിദഗ്ധർ` : `Ophthalmologists in ${district}`}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}</div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ നേത്ര കേന്ദ്രങ്ങൾ' : 'Nearby eye centres'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <EyeCentreCard key={n.id} centre={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള നേത്രരോഗ വിദഗ്ധനെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Consult a qualified ophthalmologist before any treatment. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
