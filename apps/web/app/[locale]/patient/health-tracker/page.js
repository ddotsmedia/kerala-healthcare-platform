// Health Tracker — daily metrics dashboard with trend charts. Patient-owned.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { getTrackerData } from '@/lib/healthMetrics';
import HealthTracker from '@/components/tracker/HealthTracker';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ഹെൽത്ത് ട്രാക്കർ | MalayaliDoctor' : 'Health Tracker | MalayaliDoctor' };
}

export default async function HealthTrackerPage(props) {
  const { locale: raw } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/health-tracker`);

  const days = sp.days === '7' ? 7 : 30;
  const data = await getTrackerData(uid, days);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-xl font-bold">📈 {ml ? 'ഹെൽത്ത് ട്രാക്കർ' : 'Health Tracker'}</h1>
      <p className="mt-1 text-sm text-gray-600">{ml ? 'ദിവസേനയുള്ള ആരോഗ്യ അളവുകൾ രേഖപ്പെടുത്തുക — ഭാരം, BP, പഞ്ചസാര, ഉറക്കം, മാനസികാവസ്ഥ.' : 'Log your daily health readings — weight, BP, sugar, sleep, mood — and watch the trends.'}</p>

      <div className="mt-4">
        <HealthTracker data={data} locale={locale} days={days} />
      </div>

      <div role="note" aria-label="medical-disclaimer" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ ട്രാക്കർ വ്യക്തിഗത നിരീക്ഷണത്തിന് മാത്രമുള്ളതാണ്. നിങ്ങളുടെ റീഡിംഗുകൾ ഡോക്ടറുമായി പങ്കിടുക — ഈ റീഡിംഗുകളുടെ അടിസ്ഥാനത്തിൽ സ്വയം രോഗനിർണയം നടത്തുകയോ മരുന്നുകൾ ക്രമീകരിക്കുകയോ ചെയ്യരുത്.' : 'This tracker is for personal monitoring only. Share your readings with your doctor — do not self-diagnose or adjust medications based on these readings.'}
      </div>
    </main>
  );
}
