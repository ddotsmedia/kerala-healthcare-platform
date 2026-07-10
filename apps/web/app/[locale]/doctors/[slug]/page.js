// Doctor profile — professional. Physician + BreadcrumbList + MedicalWebPage JSON-LD.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getDoctorBySlug, searchDoctors } from '@/lib/providers';
import { doctorHospitals, doctorAvailability } from '@/lib/profile';
import { providerOpd } from '@/lib/opd';
import { reviewSummary, listApprovedReviews } from '@/lib/reviews';
import { physicianSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { Avatar, ModeIcons, Chip, StatusBadge, ProfileBreadcrumb, SectionCard, MODE_META } from '@/components/profile/ProfileParts';
import Tabs from '@/components/profile/Tabs';
import ShareButton from '@/components/profile/ShareButton';
import BookingWidget from '@/components/profile/BookingWidget';
import { DoctorCard, LanguagePills, ReviewsSection } from '@khp/ui';
import WhatsAppButton from '@/components/whatsapp/WhatsAppButton';

export const dynamic = 'force-dynamic';

const DAYS = {
  ml: ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const d = await getDoctorBySlug(params.slug);
  if (!d) return { title: t(locale, 'doctors') };
  const sp = d.specialty_en || d.specialty_ml || '';
  const di = d.district_en || 'Kerala';
  return {
    title: `${d.display_name} — ${sp} in ${di} | MalayaliDoctor`.slice(0, 65),
    description: `Book an appointment with ${d.display_name}, ${sp} in ${di}, Kerala. Verified profile on MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/doctors/${d.slug}` }
  };
}

export default async function DoctorProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const d = await getDoctorBySlug(params.slug);
  if (!d) notFound();

  const [hospitals, availability, opd, similarRaw, revSummary, revInitial] = await Promise.all([
    doctorHospitals(d.id),
    doctorAvailability(d.id),
    providerOpd(d.id),
    searchDoctors({ specialtyId: d.specialty_id, districtId: d.district_id, page: 1, limit: 4 }),
    reviewSummary('doctor', d.id),
    listApprovedReviews('doctor', d.id, 1)
  ]);
  const OPD_DAYS = ml
    ? ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const opdByHospital = opd.reduce((m, o) => { (m[o.hospital_id] ||= []).push(o); return m; }, {});
  const opdLine = (o) => `${(Array.isArray(o.day_of_week) ? o.day_of_week : []).map((i) => OPD_DAYS[i]).join(', ')} · ${String(o.start_time).slice(0, 5)}–${String(o.end_time).slice(0, 5)}${o.max_tokens != null ? ` · ${o.max_tokens} ${ml ? 'ടോക്കൺ' : 'tokens'}` : ''}`;
  const similar = similarRaw.filter((x) => x.id !== d.id).slice(0, 3);

  const specialty = ml ? d.specialty_ml : d.specialty_en;
  const district = ml ? d.district_ml : d.district_en;
  const about = (ml ? d.about_ml : d.about_en) || d.about_en || d.about_ml;
  const modes = d.consultation_modes || [];
  const duration = availability[0]?.slot_duration_minutes || 30;
  const url = `${SITE}/${locale}/doctors/${d.slug}`;
  const ld = [
    physicianSchema(d, locale),
    medicalWebPageSchema(d.display_name, about || '', url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', item: `${SITE}/${locale}/doctors` },
        ...(specialty ? [{ '@type': 'ListItem', position: 3, name: specialty, item: `${SITE}/${locale}/specialties/${d.specialty_slug}` }] : []),
        { '@type': 'ListItem', position: specialty ? 4 : 3, name: d.display_name }
      ]
    }
  ];

  const aboutPanel = (
    <div className="space-y-3 text-sm text-gray-700">
      {about ? <p className="leading-relaxed">{about}</p> : <p className="text-gray-500">{ml ? 'വിവരണം ലഭ്യമല്ല' : 'No bio available'}</p>}
      {Array.isArray(d.languages) && d.languages.length > 0 && (
        <div>
          <span className="mb-1 block text-xs font-semibold text-gray-500">{ml ? 'ഭാഷകൾ' : 'Languages'}</span>
          <LanguagePills languages={d.languages} locale={locale} />
        </div>
      )}
    </div>
  );
  const eduPanel = d.education && d.education.length > 0 ? (
    <ol className="space-y-4 border-l-2 border-teal-100 pl-5">
      {d.education.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand" />
          <div className="text-sm font-semibold text-gray-900">{e.degree}</div>
          <div className="text-sm text-gray-600">
            {ml ? (e.institution_ml || e.institution_en) : (e.institution_en || e.institution_ml)}
            {e.year_completed ? ` · ${e.year_completed}` : ''}
          </div>
        </li>
      ))}
    </ol>
  ) : <p className="text-sm text-gray-500">{ml ? 'വിവരങ്ങൾ ലഭ്യമല്ല' : 'Not available'}</p>;
  const hospPanel = hospitals.length > 0 ? (
    <ul className="space-y-3">
      {hospitals.map((h) => (
        <li key={h.id} className="rounded-lg border border-gray-100 p-3">
          <Link href={`/${locale}/hospitals/${h.slug}`} className="text-sm font-semibold text-brand hover:underline">
            {ml ? h.name_ml : h.name_en}
          </Link>
          {(h.address_ml || h.address_en) && <p className="text-xs text-gray-500">{ml ? (h.address_ml || h.address_en) : (h.address_en || h.address_ml)}</p>}
          {opdByHospital[h.id] && (
            <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
              <p className="text-xs font-semibold text-gray-600">🗓️ {ml ? 'OPD സമയം' : 'OPD timings'}</p>
              {opdByHospital[h.id].map((o) => <p key={o.id} className="text-xs text-gray-700">{opdLine(o)}</p>)}
              <Link href={`/${locale}/hospitals/${h.slug}/opd`} className="text-xs font-medium text-brand hover:underline">{ml ? 'മുഴുവൻ OPD ഷെഡ്യൂൾ →' : 'Full OPD schedule →'}</Link>
            </div>
          )}
        </li>
      ))}
      {availability.length > 0 && (
        <li className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <span className="font-semibold">{ml ? 'കൺസൾട്ടേഷൻ സമയം: ' : 'Consultation times: '}</span>
          {availability.map((a, i) => (
            <span key={i} className="mr-2 inline-block">{DAYS[locale][a.day_of_week]} {String(a.start_time).slice(0, 5)}–{String(a.end_time).slice(0, 5)}</span>
          ))}
        </li>
      )}
    </ul>
  ) : <p className="text-sm text-gray-500">{ml ? 'ആശുപത്രി വിവരങ്ങൾ ലഭ്യമല്ല' : 'No hospital info'}</p>;

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProfileBreadcrumb items={[
        { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
        { name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', href: `/${locale}/doctors` },
        ...(specialty ? [{ name: specialty, href: `/${locale}/specialties/${d.specialty_slug}` }] : []),
        { name: d.display_name }
      ]} />

      {/* SECTION 1 — header */}
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Avatar src={d.photo_url} name={d.display_name} size="lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{d.display_name}</h1>
              <StatusBadge status={d.verification_status} locale={locale} />
            </div>
            {specialty && <div className="flex flex-wrap gap-2"><Chip>{specialty}</Chip></div>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              {district && <span>📍 {district}</span>}
              {d.years_experience != null && <span>{d.years_experience} {ml ? 'വർഷം അനുഭവം' : 'yrs exp'}</span>}
              {d.consultation_fee != null && <span className="font-medium text-gray-800">₹{d.consultation_fee}</span>}
            </div>
            <ModeIcons modes={modes} locale={locale} />
            {Array.isArray(d.languages) && d.languages.length > 0 && <LanguagePills languages={d.languages} locale={locale} />}
            <div className="flex flex-wrap gap-2 pt-1">
              <a href="#book" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📅 {ml ? 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക' : 'Book Appointment'}</a>
              {modes.includes('video') && <a href="#book" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">💬 {ml ? 'ഓൺലൈൻ കൺസൾട്ടേഷൻ' : 'Online Consultation'}</a>}
              <WhatsAppButton number={d.whatsapp_number} label="WhatsApp"
                message={ml
                  ? `നമസ്കാരം, ഞാൻ MalayaliDoctor.com വഴി ${d.display_name}-നെ കാണാൻ അപ്പോയ്ന്റ്മെന്റ് ആഗ്രഹിക്കുന്നു. ${url}`
                  : `Hello, I'd like to book an appointment with ${d.display_name} via MalayaliDoctor.com. ${url}`} />
              <ShareButton locale={locale} title={d.display_name} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2 — tabs */}
      <Tabs tabs={[
        { key: 'about', label: ml ? 'വിവരണം' : 'About', content: aboutPanel },
        { key: 'edu', label: ml ? 'വിദ്യാഭ്യാസം' : 'Education', content: eduPanel },
        { key: 'hosp', label: ml ? 'ആശുപത്രികൾ' : 'Hospitals', content: hospPanel }
      ]} />

      {/* SECTION 3 — booking */}
      <div id="book" className="scroll-mt-20">
        <SectionCard title={ml ? 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക' : 'Book an appointment'}>
          <BookingWidget providerId={d.id} locale={locale} modes={modes} loginPath={`/${locale}/login`} />
        </SectionCard>
      </div>

      {/* SECTION 4 — consultation info */}
      <SectionCard title={ml ? 'കൺസൾട്ടേഷൻ വിവരങ്ങൾ' : 'Consultation info'}>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt className="text-gray-500">{ml ? 'ഫീസ്' : 'Fee'}</dt><dd className="font-semibold text-gray-900">{d.consultation_fee != null ? `₹${d.consultation_fee}` : '—'}</dd></div>
          <div><dt className="text-gray-500">{ml ? 'ദൈർഘ്യം' : 'Duration'}</dt><dd className="font-semibold text-gray-900">{duration} {ml ? 'മിനിറ്റ്' : 'min'}</dd></div>
          <div><dt className="text-gray-500">{ml ? 'രീതികൾ' : 'Modes'}</dt><dd className="font-semibold text-gray-900">{modes.length ? modes.map((m) => MODE_META[m]?.icon).join(' ') : '🏥'}</dd></div>
          <div><dt className="text-gray-500">{ml ? 'പേയ്മെന്റ്' : 'Payment'}</dt><dd className="font-semibold text-gray-900">{ml ? 'ക്ലിനിക്കിൽ' : 'At clinic'}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-gray-500">
          {ml ? '2 മണിക്കൂർ മുൻപ് വരെ സൗജന്യ റദ്ദാക്കൽ · ഓൺലൈൻ പേയ്മെന്റ് ഉടൻ വരുന്നു' : 'Free cancellation up to 2 hours before · Pay online coming soon'}
        </p>
      </SectionCard>

      {/* SECTION 5 — reviews */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">{ml ? 'റിവ്യൂകളും റേറ്റിംഗുകളും' : 'Reviews & ratings'}</h2>
        <ReviewsSection entityType="doctor" entityId={d.id} locale={locale}
          initialReviews={revInitial} summary={revSummary} loginPath={`/${locale}/login`} />
      </section>

      {/* SECTION 6 — similar doctors */}
      {similar.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">{ml ? 'ഇതേ സ്പെഷ്യാലിറ്റിയിലെ മറ്റ് ഡോക്ടർമാർ' : 'Similar doctors'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => <DoctorCard key={s.id} doctor={s} locale={locale} />)}
          </div>
          {specialty && (
            <Link href={`/${locale}/specialties/${d.specialty_slug}`} className="inline-block text-sm font-semibold text-brand hover:underline">
              {ml ? `എല്ലാ ${specialty} ഡോക്ടർമാരും →` : `All ${d.specialty_en} doctors →`}
            </Link>
          )}
        </section>
      )}

      {/* SECTION 6 — disclaimer */}
      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ പ്രൊഫൈൽ വിവരങ്ങൾ മാത്രം. ഡോക്ടറെ നേരിട്ട് കണ്ട് ഉപദേശം തേടുക.' : 'This profile is for information only. Consult the doctor in person for medical advice.'}
      </div>
    </article>
  );
}
