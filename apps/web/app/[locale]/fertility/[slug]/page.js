// Fertility centre profile (SSR). Treatments grid, team of specialists, success
// rate with mandatory disclaimer. MedicalClinic + BreadcrumbList + MedicalWebPage.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getFertilityBySlug, nearbyFertility, TREATMENTS } from '@/lib/fertility';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { fertilitySchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { FertilityCard, DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const TREAT_LABELS = {
  ivf: 'IVF', iui: 'IUI', icsi: 'ICSI',
  egg_freezing: { ml: 'എഗ് ഫ്രീസിംഗ്', en: 'Egg freezing' },
  embryo_freezing: { ml: 'എംബ്രിയോ ഫ്രീസിംഗ്', en: 'Embryo freezing' },
  donor_egg: { ml: 'ഡോണർ എഗ്', en: 'Donor egg' },
  surrogacy_consultation: { ml: 'സറോഗസി കൺസൾട്ടേഷൻ', en: 'Surrogacy consultation' },
  male_infertility: { ml: 'പുരുഷ വന്ധ്യത', en: 'Male infertility' },
  sperm_bank: { ml: 'സ്‌പേം ബാങ്ക്', en: 'Sperm bank' }
};
const label = (t, ml) => { const l = TREAT_LABELS[t]; return typeof l === 'string' ? l : (l ? (ml ? l.ml : l.en) : t); };

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const f = await getFertilityBySlug(params.slug);
  if (!f) return { title: locale === 'ml' ? 'ഫെർട്ടിലിറ്റി' : 'Fertility' };
  const name = f.name_en || f.name_ml;
  const district = f.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — IVF/IUI treatments, fertility specialists. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/fertility/${f.slug}` }
  };
}

export default async function FertilityProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const f = await getFertilityBySlug(params.slug);
  if (!f) notFound();

  const gynecology = await getSpecialtyBySlug('gynecology');
  const [nearby, doctors] = await Promise.all([
    nearbyFertility(f.district_id, f.id, 3),
    gynecology ? searchDoctors({ specialtyId: gynecology.id, districtId: f.district_id, page: 1, limit: 6 }) : Promise.resolve([])
  ]);

  const name = nm(f, ml);
  const district = ml ? f.district_ml : f.district_en;
  const address = (ml ? f.address_ml : f.address_en) || f.address_en || f.address_ml;
  const phones = Array.isArray(f.phone) ? f.phone : (f.phone ? [f.phone] : []);
  const url = `${SITE}/${locale}/fertility/${f.slug}`;
  const mapsQ = (f.lat != null && f.lng != null) ? `${f.lat},${f.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const offered = Array.isArray(f.treatments) ? f.treatments : [];

  const ld = [
    fertilitySchema(f, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഫെർട്ടിലിറ്റി' : 'Fertility', item: `${SITE}/${locale}/fertility` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/fertility`} className="hover:text-brand">{ml ? 'ഫെർട്ടിലിറ്റി' : 'Fertility'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {f.established_year != null && <span>{ml ? 'സ്ഥാപിതം' : 'Established'} {f.established_year}</span>}
          {f.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(f.rating_avg).toFixed(1)} ({f.rating_count})</span>}
          {f.consultation_fee_inr != null && <span>₹{f.consultation_fee_inr} {ml ? 'കൺസൾട്ടേഷൻ' : 'consultation'}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {f.has_sperm_bank && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{ml ? 'സ്‌പേം ബാങ്ക്' : 'Sperm bank'}</span>}
          {f.has_egg_donation && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-brand">{ml ? 'എഗ് ഡൊണേഷൻ' : 'Egg donation'}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
          {f.website && <a href={f.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">🌐 {ml ? 'വെബ്‌സൈറ്റ്' : 'Website'}</a>}
        </div>
      </header>

      {/* Success rate — always with disclaimer */}
      {f.ivf_success_rate_percent != null && (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-indigo-700">{f.ivf_success_rate_percent}%</span>
            <span className="text-sm font-medium text-gray-700">{ml ? 'IVF വിജയ നിരക്ക് (സ്വയം റിപ്പോർട്ട് ചെയ്തത്)' : 'IVF success rate (self-reported)'}</span>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            {ml ? 'വിജയ നിരക്കുകൾ സ്വയം റിപ്പോർട്ട് ചെയ്തതും ഓരോ കേസിനും വ്യത്യാസപ്പെടുന്നതുമാണ്. ഒരു വിദഗ്ധനെ സമീപിക്കുക.' : 'Success rates are self-reported and vary by individual case. Consult a specialist.'}
          </p>
        </section>
      )}

      {/* Treatments grid */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ചികിത്സകൾ' : 'Treatments offered'}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TREATMENTS.map((t) => {
            const has = offered.includes(t);
            return (
              <div key={t} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-teal-200 bg-teal-50 text-brand' : 'border-gray-100 text-gray-400'}`}>
                <span>{has ? '✅' : '—'}</span><span className="truncate">{label(t, ml)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team of specialists */}
      {doctors.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? `${district}-ലെ വിദഗ്ധർ` : `Specialists in ${district}`}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}</div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ഫെർട്ടിലിറ്റി കേന്ദ്രങ്ങൾ' : 'Nearby fertility centres'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <FertilityCard key={n.id} centre={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'വിജയ നിരക്കുകൾ സ്വയം റിപ്പോർട്ട് ചെയ്തതും ഓരോ കേസിനും വ്യത്യാസപ്പെടുന്നതുമാണ്. ഒരു വിദഗ്ധനെ സമീപിക്കുക. ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം.' : 'Success rates are self-reported and vary by individual case. Consult a specialist. This information is for general awareness only.'}
      </div>
    </article>
  );
}
