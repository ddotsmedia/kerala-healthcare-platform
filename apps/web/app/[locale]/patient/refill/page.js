// Prescription refill — request repeat prescriptions from your doctor.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listPrescriptions } from '@/lib/prescriptions';
import { listMyDoctors, listMyRefillRequests } from '@/lib/refills';
import RefillForm from '@/components/refill/RefillForm';

export const dynamic = 'force-dynamic';

const STATUS = {
  pending: { ml: 'കാത്തിരിക്കുന്നു', en: 'Pending', tone: 'bg-amber-50 text-amber-700' },
  approved: { ml: 'അംഗീകരിച്ചു', en: 'Approved', tone: 'bg-green-50 text-green-700' },
  rejected: { ml: 'നിരസിച്ചു', en: 'Rejected', tone: 'bg-red-50 text-red-600' },
  dispatched: { ml: 'അയച്ചു', en: 'Dispatched', tone: 'bg-blue-50 text-blue-700' }
};

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'പ്രിസ്ക്രിപ്ഷൻ റീഫിൽ | MalayaliDoctor' : 'Prescription Refill | MalayaliDoctor' };
}

export default async function RefillPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/refill`);

  const [prescriptions, doctors, requests] = await Promise.all([
    listPrescriptions(uid, ''), listMyDoctors(uid), listMyRefillRequests(uid)
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold">🔁 {ml ? 'പ്രിസ്ക്രിപ്ഷൻ റീഫിൽ' : 'Prescription Refill'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'ദീർഘകാല അസുഖങ്ങൾക്ക് അതേ ഡോക്ടറിൽ നിന്ന് ആവർത്തിച്ചുള്ള പ്രിസ്ക്രിപ്ഷൻ അഭ്യർത്ഥിക്കുക.' : 'Request a repeat prescription from the same doctor for chronic conditions.'}</p>

      {doctors.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{ml ? 'റീഫിൽ അഭ്യർത്ഥിക്കാൻ ആദ്യം ഒരു ഡോക്ടറുമായി അപ്പോയിന്റ്മെന്റ് വേണം.' : 'You need a prior appointment with a doctor before requesting a refill.'}</p>
      ) : (
        <RefillForm prescriptions={prescriptions} doctors={doctors} locale={locale} />
      )}

      {requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">{ml ? 'എന്റെ അഭ്യർത്ഥനകൾ' : 'My requests'}</h2>
          {requests.map((r) => {
            const st = STATUS[r.status] || STATUS.pending;
            const meds = Array.isArray(r.medications_requested) ? r.medications_requested : [];
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{r.doctor_name} · {meds.map((m) => m.name).join(', ')}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${st.tone}`}>{ml ? st.ml : st.en}</span>
                </div>
                {r.doctor_notes && <p className="mt-1 text-xs text-gray-600">📝 {r.doctor_notes}</p>}
                {r.status === 'approved' && r.new_prescription_id && (
                  <a href={`/${locale}/patient/prescriptions/${r.new_prescription_id}`} className="mt-1 inline-block text-xs font-medium text-brand">{ml ? 'പുതിയ പ്രിസ്ക്രിപ്ഷൻ കാണുക →' : 'View new prescription →'}</a>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'റീഫിൽ ഡോക്ടറുടെ വിവേചനാധികാരത്തിലാണ്. അംഗീകാരമില്ലാതെ മരുന്നുകൾ കഴിക്കുന്നത് തുടരരുത്.' : 'Refills are at the doctor’s discretion. Do not continue medication without approval.'}
      </div>
    </main>
  );
}
