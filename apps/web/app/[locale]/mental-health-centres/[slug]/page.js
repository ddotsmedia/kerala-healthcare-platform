// Mental health centre profile (SSR). Crisis banner, services grid, inpatient +
// emergency info, linked psychiatrists. Non-stigmatising language.
// MedicalOrganization + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getMentalHealthBySlug, nearbyMentalHealth, SERVICES } from '@/lib/mentalHealth';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { mentalHealthSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { MentalHealthCentreCard, DoctorCard } from '@khp/ui';
import CrisisBanner from '@/components/mentalhealth/CrisisBanner';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const SERVICE_LABELS = {
  psychiatry: { ml: 'സൈക്യാട്രി', en: 'Psychiatry' }, psychology: { ml: 'സൈക്കോളജി', en: 'Psychology' },
  counselling: { ml: 'കൗൺസലിംഗ്', en: 'Counselling' }, deaddiction: { ml: 'ഡീ-അഡിക്ഷൻ', en: 'De-addiction' },
  rehabilitation: { ml: 'പുനരധിവാസം', en: 'Rehabilitation' }, group_therapy: { ml: 'ഗ്രൂപ്പ് തെറാപ്പി', en: 'Group therapy' }
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const m = await getMentalHealthBySlug(params.slug);
  if (!m) return { title: locale === 'ml' ? 'മാനസികാരോഗ്യ കേന്ദ്രങ്ങൾ' : 'Mental Health Centres' };
  const name = m.name_en || m.name_ml;
  const district = m.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — mental health services, confidential support. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/mental-health-centres/${m.slug}` }
  };
}

export default async function MentalHealthProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const m = await getMentalHealthBySlug(params.slug);
  if (!m) notFound();

  const psychiatry = await getSpecialtyBySlug('psychiatry');
  const [nearby, doctors] = await Promise.all([
    nearbyMentalHealth(m.district_id, m.id, 3),
    psychiatry ? searchDoctors({ specialtyId: psychiatry.id, districtId: m.district_id, page: 1, limit: 6 }) : Promise.resolve([])
  ]);

  const name = nm(m, ml);
  const district = ml ? m.district_ml : m.district_en;
  const address = (ml ? m.address_ml : m.address_en) || m.address_en || m.address_ml;
  const phones = Array.isArray(m.phone) ? m.phone : (m.phone ? [m.phone] : []);
  const url = `${SITE}/${locale}/mental-health-centres/${m.slug}`;
  const mapsQ = (m.lat != null && m.lng != null) ? `${m.lat},${m.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const services = Array.isArray(m.services) ? m.services : [];

  const ld = [
    mentalHealthSchema(m, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'മാനസികാരോഗ്യ കേന്ദ്രങ്ങൾ' : 'Mental Health Centres', item: `${SITE}/${locale}/mental-health-centres` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/mental-health-centres`} className="hover:text-brand">{ml ? 'മാനസികാരോഗ്യം' : 'Mental Health'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <CrisisBanner locale={locale} />

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {m.is_govt_approved && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{ml ? 'സർക്കാർ അംഗീകൃതം' : 'Govt approved'}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {m.rating_count > 0 && <span className="font-medium text-amber-600">⭐ {Number(m.rating_avg).toFixed(1)} ({m.rating_count})</span>}
          {m.consultation_fee_inr != null && <span>₹{m.consultation_fee_inr} {ml ? 'കൺസൾട്ടേഷൻ' : 'consultation'}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {m.has_emergency && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">{ml ? '24x7 അടിയന്തര പിന്തുണ' : '24x7 emergency support'}</span>}
          {m.has_inpatient && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{ml ? 'ഇൻപേഷ്യന്റ്' : 'Inpatient'}{m.inpatient_beds ? ` · ${m.inpatient_beds} ${ml ? 'ബെഡ്' : 'beds'}` : ''}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(m.emergency_phone || phones[0]) && <a href={`tel:${m.emergency_phone || phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {m.emergency_phone || phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
          {m.website && <a href={m.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">🌐 {ml ? 'വെബ്‌സൈറ്റ്' : 'Website'}</a>}
        </div>
      </header>

      {/* Services grid */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സേവനങ്ങൾ' : 'Services'}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICES.map((s) => {
            const has = services.includes(s);
            const l = SERVICE_LABELS[s];
            return (
              <div key={s} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-400'}`}>
                <span>{has ? '✅' : '—'}</span><span className="truncate">{l ? (ml ? l.ml : l.en) : s}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Linked psychiatrists */}
      {doctors.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? `${district}-ലെ മാനസികാരോഗ്യ വിദഗ്ധർ` : `Mental health professionals in ${district}`}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}</div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ കേന്ദ്രങ്ങൾ' : 'Nearby centres'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <MentalHealthCentreCard key={n.id} centre={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'മാനസികാരോഗ്യ പ്രശ്നങ്ങൾ ചികിത്സിക്കാവുന്നതാണ്, സഹായം തേടുന്നത് കരുത്തിന്റെ അടയാളമാണ്. ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം — യോഗ്യതയുള്ള മാനസികാരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 വിളിക്കുക.' : 'Mental health conditions are treatable, and reaching out is a sign of strength. This information is for general awareness only — please consult a qualified mental health professional. In an emergency call 112.'}
      </div>
    </article>
  );
}
