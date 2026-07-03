// Hospital profile — professional. Hospital + BreadcrumbList + MedicalWebPage JSON-LD.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getHospitalBySlug, searchHospitals } from '@/lib/providers';
import { hospitalDoctors } from '@/lib/profile';
import { hospitalSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { StatusBadge, Chip, ProfileBreadcrumb, SectionCard } from '@/components/profile/ProfileParts';
import Tabs from '@/components/profile/Tabs';
import ShareButton, { CopyButton } from '@/components/profile/ShareButton';
import { DoctorCard, HospitalCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

const TYPE_LABELS = {
  government: { ml: 'സർക്കാർ', en: 'Government' },
  private: { ml: 'സ്വകാര്യം', en: 'Private' },
  charitable: { ml: 'ചാരിറ്റബിൾ', en: 'Charitable' },
  ayurveda: { ml: 'ആയുർവേദം', en: 'Ayurveda' }
};
const SERVICE_ICONS = [
  ['lab', '🧪'], ['mri', '📷'], ['ct', '🔬'], ['icu', '💉'], ['nicu', '👶'],
  ['cath', '🫀'], ['dialysis', '🧬'], ['ivf', '🍼'], ['dental', '🦷'], ['pharmacy', '💊'], ['emergency', '🚑']
];
const serviceIcon = (name = '') => {
  const n = name.toLowerCase();
  const hit = SERVICE_ICONS.find(([k]) => n.includes(k));
  return hit ? hit[1] : '✅';
};
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const h = await getHospitalBySlug(params.slug);
  if (!h) return { title: t(locale, 'hospitals') };
  const name = h.name_en || h.name_ml;
  return {
    title: `${name} — ${h.district_en || 'Kerala'}, Kerala | MalayaliDoctor`.slice(0, 65),
    description: `${name} in ${h.district_en || 'Kerala'} — departments, services, doctors. Verified on MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/hospitals/${h.slug}` }
  };
}

export default async function HospitalProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const h = await getHospitalBySlug(params.slug);
  if (!h) notFound();

  const [docs, nearbyRaw] = await Promise.all([
    hospitalDoctors(h.id, 12),
    searchHospitals({ districtId: h.district_id, page: 1, limit: 4 })
  ]);
  const nearby = nearbyRaw.filter((x) => x.id !== h.id).slice(0, 3);

  const name = nm(h, ml);
  const district = ml ? h.district_ml : h.district_en;
  const address = (ml ? h.address_ml : h.address_en) || h.address_en || h.address_ml;
  const about = (ml ? h.about_ml : h.about_en) || h.about_en || h.about_ml;
  const type = TYPE_LABELS[h.type];
  const departments = h.departments || [];
  const services = h.services || [];
  const accreditations = h.accreditations || [];
  const url = `${SITE}/${locale}/hospitals/${h.slug}`;
  const mapsQ = (h.latitude != null && h.longitude != null) ? `${h.latitude},${h.longitude}` : encodeURIComponent(`${name} ${district || ''} Kerala`);

  const ld = [
    hospitalSchema(h, locale, { departments, services }),
    medicalWebPageSchema(name, about || '', url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ആശുപത്രികൾ' : 'Hospitals', item: `${SITE}/${locale}/hospitals` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  const aboutPanel = (
    <div className="text-sm leading-relaxed text-gray-700">
      {about || <span className="text-gray-500">{ml ? 'വിവരണം ലഭ്യമല്ല' : 'No description available'}</span>}
    </div>
  );
  const deptPanel = departments.length > 0 ? (
    <div className="flex flex-wrap gap-2">{departments.map((dep, i) => <Chip key={i} tone="gray">{nm(dep, ml)}</Chip>)}</div>
  ) : <p className="text-sm text-gray-500">{ml ? 'ലഭ്യമല്ല' : 'Not available'}</p>;
  const svcPanel = services.length > 0 ? (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {services.map((s, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
          <span aria-hidden="true">{serviceIcon(s.name_en || '')}</span>
          <span className="flex-1 truncate text-gray-700">{nm(s, ml)}</span>
          <span className="text-green-600">✓</span>
        </div>
      ))}
    </div>
  ) : <p className="text-sm text-gray-500">{ml ? 'ലഭ്യമല്ല' : 'Not available'}</p>;
  const docsPanel = docs.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{docs.map((doc) => <DoctorCard key={doc.id} doctor={doc} locale={locale} />)}</div>
  ) : <p className="text-sm text-gray-500">{ml ? 'അഫിലിയേറ്റഡ് ഡോക്ടർമാരില്ല' : 'No affiliated doctors listed'}</p>;

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProfileBreadcrumb items={[
        { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
        { name: ml ? 'ആശുപത്രികൾ' : 'Hospitals', href: `/${locale}/hospitals` },
        { name }
      ]} />

      {/* SECTION 1 — header */}
      <SectionCard>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <StatusBadge status={h.verification_status} locale={locale} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {type && <Chip tone="teal">{type[locale] || type.en}</Chip>}
            {h.emergency_24x7 && <Chip tone="amber">{ml ? '24x7 എമർജൻസി' : '24x7 Emergency'}</Chip>}
          </div>
          <div className="text-sm text-gray-600">
            {district && <span>📍 {district}</span>}{address && <span> · {address}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: h.bed_count ?? '—', l: ml ? 'ബെഡുകൾ' : 'Beds' },
              { v: h.emergency_24x7 ? '✓' : '–', l: ml ? 'എമർജൻസി' : 'Emergency' },
              { v: departments.length, l: ml ? 'വിഭാഗങ്ങൾ' : 'Departments' },
              { v: services.length, l: ml ? 'സേവനങ്ങൾ' : 'Services' }
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-teal-50 p-3 text-center">
                <div className="text-xl font-extrabold text-brand">{s.v}</div>
                <div className="text-xs text-gray-600">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={`/${locale}/doctors?hospital=${h.slug}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              📅 {ml ? 'ഇവിടെ ഡോക്ടറെ കണ്ടെത്തൂ' : 'Find a Doctor Here'}
            </Link>
            <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">
              🗺️ {ml ? 'വഴി കാണിക്കുക' : 'Directions'}
            </a>
            <ShareButton locale={locale} title={name} />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2 — tabs */}
      <Tabs tabs={[
        { key: 'about', label: ml ? 'വിവരണം' : 'About', content: aboutPanel },
        { key: 'dept', label: ml ? 'വിഭാഗങ്ങൾ' : 'Departments', content: deptPanel },
        { key: 'svc', label: ml ? 'സേവനങ്ങൾ' : 'Services', content: svcPanel },
        { key: 'docs', label: ml ? 'ഡോക്ടർമാർ' : 'Doctors', content: docsPanel }
      ]} />

      {/* SECTION 3 — accreditations */}
      {accreditations.length > 0 && (
        <SectionCard title={ml ? 'അക്രഡിറ്റേഷനുകൾ' : 'Accreditations'}>
          <div className="flex flex-wrap gap-2">
            {accreditations.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                🏅 {a.body}{a.accreditation_no ? ` · ${a.accreditation_no}` : ''}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* SECTION 4 — location */}
      <SectionCard title={ml ? 'സ്ഥലം' : 'Location'}>
        <div className="space-y-2 text-sm text-gray-700">
          {address && <div className="flex items-start justify-between gap-3"><span>{address}{district ? `, ${district}` : ''}</span><CopyButton text={`${address}${district ? ', ' + district : ''}`} locale={locale} /></div>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-brand hover:underline">
            🗺️ {ml ? 'ഗൂഗിൾ മാപ്സിൽ കാണുക →' : 'View on Google Maps →'}
          </a>
        </div>
        {nearby.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'സമീപത്തെ ആശുപത്രികൾ' : 'Nearby hospitals'}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {nearby.map((n) => <HospitalCard key={n.id} hospital={n} locale={locale} />)}
            </div>
          </div>
        )}
      </SectionCard>

      {/* SECTION 5 — departments list */}
      {departments.length > 0 && (
        <SectionCard title={ml ? 'വിഭാഗങ്ങൾ' : 'Departments'}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {departments.map((dep, i) => (
              <Link key={i} href={`/${locale}/doctors?hospital=${h.slug}&department=${encodeURIComponent(nm(dep, false))}`}
                className="rounded-xl border border-gray-200 bg-white p-3 text-center text-sm font-medium text-gray-800 shadow-sm hover:shadow-md">
                {nm(dep, ml)}
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {/* disclaimer */}
      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ പ്രൊഫൈൽ വിവരങ്ങൾ മാത്രം. സേവനങ്ങൾക്കായി ആശുപത്രിയുമായി നേരിട്ട് ബന്ധപ്പെടുക.' : 'This profile is for information only. Contact the hospital directly for services.'}
      </div>
    </article>
  );
}
