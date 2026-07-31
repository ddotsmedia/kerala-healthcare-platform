// DoctorAdLanding — conversion-focused landing for paid search
// ("[Specialty] Doctor in [District]"). Server component; data passed in.

import Link from 'next/link';
import { DoctorCard } from '@khp/ui';
import { withUtm } from '@/lib/utm';

export default function DoctorAdLanding({ locale, specialty, district, doctors, verifiedCount, reviewCount, utm }) {
  const ml = locale === 'ml';
  const spName = (ml ? specialty.name_ml : specialty.name_en) || specialty.name_en;
  const diName = (ml ? district.name_ml : district.name_en) || district.name_en;
  const top = doctors.slice(0, 3);
  const searchHref = withUtm(`/${locale}/doctors?specialty=${specialty.id}&district=${district.id}`, utm);
  const bookHref = (slug) => withUtm(`/${locale}/book/${slug}`, utm);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {/* Above the fold: headline + trust + search */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] p-6 text-white">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {ml ? `${diName}-ലെ മികച്ച ${spName}` : `Best ${spName} in ${diName}`}
        </h1>
        <p className="mt-1 text-sm text-white/90">
          {ml
            ? 'വെരിഫൈഡ് ഡോക്ടർമാർ · സൗജന്യ ഓൺലൈൻ ബുക്കിംഗ് · യഥാർത്ഥ റിവ്യൂകൾ'
            : 'Verified doctors · Free online booking · Genuine patient reviews'}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-white/20 px-3 py-1">✓ {verifiedCount} {ml ? 'വെരിഫൈഡ്' : 'verified'}</span>
          {reviewCount > 0 && <span className="rounded-full bg-white/20 px-3 py-1">★ {reviewCount} {ml ? 'റിവ്യൂകൾ' : 'reviews'}</span>}
        </div>
        <Link href={searchHref}
          className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-gray-100">
          🔍 {ml ? `എല്ലാ ${spName}മാരെയും കാണൂ` : `See all ${spName}s`}
        </Link>
      </section>

      {/* Top 3 doctors */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          {ml ? 'മുൻനിര ഡോക്ടർമാർ' : 'Top doctors'}
        </h2>
        {top.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            {ml ? 'ഉടൻ ലഭ്യമാകും.' : 'Coming soon.'}
          </p>
        ) : (
          <div className="space-y-3">
            {top.map((d) => (
              <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-3">
                <DoctorCard doctor={d} locale={locale} />
                <Link href={bookHref(d.slug)}
                  className="mt-2 block rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-dark">
                  📅 {ml ? 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക' : 'Book Appointment'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <div role="note" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml
          ? 'MalayaliDoctor ഡോക്ടർമാരെ കണ്ടെത്താനും അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാനും സഹായിക്കുന്നു. ഇത് വൈദ്യോപദേശമല്ല. അടിയന്തരം: 112 · ആംബുലൻസ്: 108.'
          : 'MalayaliDoctor helps you find doctors and book appointments. This is not medical advice. Emergency: 112 · Ambulance: 108.'}
      </div>
    </main>
  );
}
