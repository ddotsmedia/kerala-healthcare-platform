// Medication Reminders — set reminder times; get email + in-app notifications.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listReminders } from '@/lib/medReminders';
import { EmptyState } from '@khp/ui';
import RemindersManager from '@/components/reminders/RemindersManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'മരുന്ന് ഓർമ്മപ്പെടുത്തലുകൾ | MalayaliDoctor' : 'Medication Reminders | MalayaliDoctor' };
}

export default async function RemindersPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/reminders`);
  const reminders = await listReminders(uid);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">⏰ {ml ? 'മരുന്ന് ഓർമ്മപ്പെടുത്തലുകൾ' : 'Medication Reminders'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'മരുന്ന് കഴിക്കാൻ സമയമാകുമ്പോൾ ഇമെയിലും ഇൻ-ആപ്പ് അറിയിപ്പും ലഭിക്കും.' : 'Get an email and in-app notification when it’s time to take your medication.'}</p>

      {reminders.length === 0 && <EmptyState message={ml ? 'ഓർമ്മപ്പെടുത്തലുകളൊന്നുമില്ല. ഒരെണ്ണം ചേർക്കൂ.' : 'No reminders yet. Add one below.'} />}
      <RemindersManager reminders={reminders} locale={locale} />

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഈ ഓർമ്മപ്പെടുത്തലുകൾ ഒരു സഹായം മാത്രം. മരുന്ന് ഡോക്ടറുടെ നിർദേശപ്രകാരം മാത്രം കഴിക്കുക; ഡോസ് സ്വയം മാറ്റരുത്.' : 'These reminders are an aid only. Take medication exactly as prescribed by your doctor; do not change doses on your own.'}
      </div>
    </main>
  );
}
