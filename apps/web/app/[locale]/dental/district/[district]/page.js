// Dental clinics + dentists in a district — high-value SEO landing page.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { searchDental } from '@/lib/dental';
import { searchDoctors } from '@/lib/providers';
import { getDistrictBySlug, getSpecialtyBySlug } from '@/lib/landing';
import { medicalWebPageSchema, SITE } from '@/lib/schema';
import { DentalCard, DoctorCard, EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const d = await getDistrictBySlug(params.district);
  if (!d) return { title: locale === 'ml' ? 'ഡെന്റൽ' : 'Dental' };
  const dn = locale === 'ml' ? d.name_ml : d.name_en;
  return {
    title: `${locale === 'ml' ? `${dn}-ലെ ദന്തഡോക്ടർമാർ` : `Dentists in ${d.name_en}`} | MalayaliDoctor`.slice(0, 65),
    description: `${locale === 'ml' ? `${dn}-ലെ മികച്ച ഡെന്റൽ ക്ലിനിക്കുകളും ദന്തഡോക്ടർമാരും` : `Top dental clinics and dentists in ${d.name_en}, Kerala`}. MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/dental/district/${params.district}` }
  };
}

export default async function DentalDistrictPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const d = await getDistrictBySlug(params.district);
  if (!d) notFound();

  const dentistry = await getSpecialtyBySlug('dentistry');
  const [clinics, dentists] = await Promise.all([
    searchDental({ districtId: d.id, page: 1, limit: 50 }),
    dentistry ? searchDoctors({ specialtyId: dentistry.id, districtId: d.id, page: 1, limit: 12 }) : Promise.resolve([])
  ]);
  const dn = ml ? d.name_ml : d.name_en;

  const ld = medicalWebPageSchema(
    ml ? `${dn}-ലെ ദന്തഡോക്ടർമാർ` : `Dentists in ${d.name_en}`,
    `Dental clinics and dentists in ${d.name_en}, Kerala.`,
    `${SITE}/${locale}/dental/district/${params.district}`);

  return (
    <div className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/dental`} className="hover:text-brand">{ml ? 'ഡെന്റൽ' : 'Dental'}</Link> › <span className="text-gray-700">{dn}</span>
      </nav>

      <h1 className="text-xl font-bold">🦷 {ml ? `${dn}-ലെ ദന്തചികിത്സ` : `Dental care in ${d.name_en}`}</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'ഡെന്റൽ ക്ലിനിക്കുകൾ' : 'Dental clinics'}</h2>
        {clinics.length === 0 ? <EmptyState message={ml ? 'ക്ലിനിക്കുകളൊന്നുമില്ല' : 'No clinics listed yet'} /> : (
          <div className="grid gap-3 sm:grid-cols-2">{clinics.map((c) => <DentalCard key={c.id} clinic={c} locale={locale} />)}</div>
        )}
      </section>

      {dentists.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'ദന്തഡോക്ടർമാർ' : 'Dentists'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{dentists.map((doc) => <DoctorCard key={doc.id} doctor={doc} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യതയുള്ള ദന്തഡോക്ടറെ സമീപിക്കുക.' : 'This information is for general awareness only. Consult a qualified dentist before any treatment.'}
      </div>
    </div>
  );
}
