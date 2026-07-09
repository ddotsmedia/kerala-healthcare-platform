// Physiotherapy centre profile (SSR). Specialisations grid, equipment, home-visit
// coverage, linked physiotherapists (if taxonomy has a physiotherapy specialty).
// MedicalOrganization + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getPhysioBySlug, nearbyPhysio, SPECIALISATIONS } from '@/lib/physio';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { physioSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { PhysioCard, DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const SPEC_LABELS = {
  ortho: { ml: 'ഓർത്തോപീഡിക്', en: 'Orthopaedic' }, neuro: { ml: 'ന്യൂറോളജിക്കൽ', en: 'Neurological' },
  cardio: { ml: 'കാർഡിയോ', en: 'Cardio' }, paediatric: { ml: 'ശിശു', en: 'Paediatric' },
  sports: { ml: 'സ്പോർട്സ്', en: 'Sports' }, geriatric: { ml: 'വയോജന', en: 'Geriatric' }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const p = await getPhysioBySlug(params.slug);
  if (!p) return { title: locale === 'ml' ? 'ഫിസിയോതെറാപ്പി' : 'Physiotherapy' };
  const name = p.name_en || p.name_ml;
  const district = p.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — physiotherapy specialisations, equipment, home visits. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/physiotherapy/${p.slug}` }
  };
}

export default async function PhysioProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const p = await getPhysioBySlug(params.slug);
  if (!p) notFound();

  const specialty = await getSpecialtyBySlug('physiotherapy');
  const [nearby, physios] = await Promise.all([
    nearbyPhysio(p.district_id, p.id, 3),
    specialty ? searchDoctors({ specialtyId: specialty.id, districtId: p.district_id, page: 1, limit: 6 }) : Promise.resolve([])
  ]);

  const name = nm(p, ml);
  const district = ml ? p.district_ml : p.district_en;
  const address = (ml ? p.address_ml : p.address_en) || p.address_en || p.address_ml;
  const phones = Array.isArray(p.phone) ? p.phone : (p.phone ? [p.phone] : []);
  const url = `${SITE}/${locale}/physiotherapy/${p.slug}`;
  const mapsQ = (p.lat != null && p.lng != null) ? `${p.lat},${p.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const specs = Array.isArray(p.specialisations) ? p.specialisations : [];
  const equip = Array.isArray(p.equipment) ? p.equipment : [];
  const homeDistricts = Array.isArray(p.home_visit_districts) ? p.home_visit_districts : [];

  const ld = [
    physioSchema(p, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഫിസിയോതെറാപ്പി' : 'Physiotherapy', item: `${SITE}/${locale}/physiotherapy` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/physiotherapy`} className="hover:text-brand">{ml ? 'ഫിസിയോതെറാപ്പി' : 'Physiotherapy'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {p.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(p.rating_avg).toFixed(1)} ({p.rating_count})</span>}
          {p.consultation_fee_inr != null && <span>₹{p.consultation_fee_inr} {ml ? 'കൺസൾട്ടേഷൻ' : 'consult'}</span>}
          {p.session_fee_inr != null && <span>₹{p.session_fee_inr} {ml ? '/സെഷൻ' : '/session'}</span>}
        </div>
        {p.has_home_visit && <p className="mt-2 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-brand">🏠 {ml ? 'ഹോം വിസിറ്റ് ലഭ്യം' : 'Home visit available'}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
        </div>
      </header>

      {/* Specialisations grid */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സ്പെഷ്യലൈസേഷനുകൾ' : 'Specialisations'}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SPECIALISATIONS.map((s) => {
            const has = specs.includes(s);
            const l = SPEC_LABELS[s];
            return (
              <div key={s} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-teal-200 bg-teal-50 text-brand' : 'border-gray-100 text-gray-400'}`}>
                <span>{has ? '✅' : '—'}</span><span className="truncate">{l ? (ml ? l.ml : l.en) : s}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Equipment + Home visit coverage */}
      <div className="grid gap-6 sm:grid-cols-2">
        {equip.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഉപകരണങ്ങൾ' : 'Equipment'}</h2>
            <div className="flex flex-wrap gap-2">{equip.map((k) => <span key={k} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">🔧 {k}</span>)}</div>
          </section>
        )}
        {p.has_home_visit && (
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഹോം വിസിറ്റ് കവറേജ്' : 'Home visit coverage'}</h2>
            {homeDistricts.length ? <div className="flex flex-wrap gap-2">{homeDistricts.map((d) => <span key={d} className="rounded-full bg-teal-50 px-3 py-1 text-sm text-brand">📍 {d}</span>)}</div>
              : <p className="text-sm text-gray-600">{ml ? 'വിശദാംശങ്ങൾക്ക് വിളിക്കുക' : 'Call for coverage details'}</p>}
          </section>
        )}
      </div>

      {/* Linked physiotherapists */}
      {physios.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? `${district}-ലെ ഫിസിയോതെറാപ്പിസ്റ്റുകൾ` : `Physiotherapists in ${district}`}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{physios.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}</div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ഫിസിയോ കേന്ദ്രങ്ങൾ' : 'Nearby physio centres'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <PhysioCard key={n.id} centre={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള ഫിസിയോതെറാപ്പിസ്റ്റിനെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'This information is for general awareness only. Consult a qualified physiotherapist before any treatment. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
