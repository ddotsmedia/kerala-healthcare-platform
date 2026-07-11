// Second Opinion — educational intro, request form, my requests + matched doctor.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listSpecialties, listDistricts } from '@/lib/providers';
import { listRecords } from '@/lib/phr';
import { listMyRequests } from '@/lib/secondOpinion';
import SecondOpinionForm from '@/components/secondopinion/SecondOpinionForm';

export const dynamic = 'force-dynamic';

const STATUS = {
  open: { ml: 'തുറന്നത്', en: 'Open', tone: 'bg-blue-50 text-blue-700' },
  matched: { ml: 'പൊരുത്തപ്പെട്ടു', en: 'Matched', tone: 'bg-green-50 text-green-700' },
  completed: { ml: 'പൂർത്തിയായി', en: 'Completed', tone: 'bg-gray-100 text-gray-600' },
  cancelled: { ml: 'റദ്ദാക്കി', en: 'Cancelled', tone: 'bg-red-50 text-red-600' }
};

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'രണ്ടാം അഭിപ്രായം | MalayaliDoctor' : 'Get a Second Opinion | MalayaliDoctor',
    description: ml ? 'മറ്റൊരു സ്പെഷ്യലിസ്റ്റിൽ നിന്ന് നിങ്ങളുടെ രോഗനിർണയത്തിന് രണ്ടാം അഭിപ്രായം നേടുക.' : 'Get a second opinion on your diagnosis from another specialist.'
  };
}

export default async function SecondOpinionPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/second-opinion`);

  const [specialties, districts, records, requests] = await Promise.all([
    listSpecialties(), listDistricts(), listRecords(uid), listMyRequests(uid)
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold">🩺 {ml ? 'രണ്ടാം അഭിപ്രായം നേടുക' : 'Get a Second Opinion'}</h1>

      {/* Educational intro */}
      <section className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm leading-relaxed text-gray-700">
        {ml ? 'ഗുരുതരമായ രോഗനിർണയമോ ചികിത്സാ തീരുമാനമോ ഉള്ളപ്പോൾ, മറ്റൊരു യോഗ്യതയുള്ള സ്പെഷ്യലിസ്റ്റിന്റെ അഭിപ്രായം തേടുന്നത് നിങ്ങളുടെ അവകാശമാണ്. നിങ്ങളുടെ അവസ്ഥ വിവരിക്കുക — ഞങ്ങൾ അനുയോജ്യമായ ഒരു വിദഗ്ധനുമായി പൊരുത്തപ്പെടുത്തും.' : 'When facing a serious diagnosis or treatment decision, seeking another qualified specialist’s view is your right. Describe your condition and we’ll match you with a suitable expert.'}
      </section>

      <SecondOpinionForm specialties={specialties} districts={districts} records={records} locale={locale} />

      {/* My requests */}
      {requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">{ml ? 'എന്റെ അഭ്യർത്ഥനകൾ' : 'My requests'}</h2>
          {requests.map((r) => {
            const st = STATUS[r.status] || STATUS.open;
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{r.condition_description}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${st.tone}`}>{ml ? st.ml : st.en}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
                  {(r.specialty_en || r.specialty_ml) && <span>{ml ? r.specialty_ml : r.specialty_en}</span>}
                  {(r.district_en || r.district_ml) && <span>📍 {ml ? r.district_ml : r.district_en}</span>}
                  <span className="capitalize">{r.urgency}</span>
                </div>
                {r.status === 'matched' && r.matched_doctor_slug && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 p-3">
                    <span className="text-sm text-gray-700">{ml ? 'പൊരുത്തപ്പെട്ട ഡോക്ടർ' : 'Matched doctor'}: <b>{r.matched_doctor_name}</b>{r.matched_doctor_fee != null ? ` · ₹${r.matched_doctor_fee}` : ''}</span>
                    <Link href={`/${locale}/book/${r.matched_doctor_slug}`} className="ml-auto rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">📅 {ml ? 'ബുക്ക് ചെയ്യുക' : 'Book'}</Link>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'രണ്ടാം അഭിപ്രായം ഒരു യോഗ്യതയുള്ള ഡോക്ടറുടെ കൺസൾട്ടേഷനിലൂടെ മാത്രം. ഈ പ്ലാറ്റ്ഫോം രോഗനിർണയമോ ചികിത്സയോ നൽകുന്നില്ല.' : 'A second opinion is provided only through a consultation with a qualified doctor. This platform does not provide diagnosis or treatment.'}
      </div>
    </main>
  );
}
