// Health Goals — set + track targets; progress auto-syncs from the health tracker.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listGoals } from '@/lib/goals';
import { EmptyState } from '@khp/ui';
import GoalsManager from '@/components/goals/GoalsManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ആരോഗ്യ ലക്ഷ്യങ്ങൾ | MalayaliDoctor' : 'Health Goals | MalayaliDoctor' };
}

export default async function GoalsPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/goals`);
  const goals = await listGoals(uid);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">🎯 {ml ? 'ആരോഗ്യ ലക്ഷ്യങ്ങൾ' : 'Health Goals'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'ഭാരം, BP, സ്റ്റെപ്പുകൾ, HbA1c തുടങ്ങിയവയ്ക്ക് ലക്ഷ്യങ്ങൾ സജ്ജമാക്കുക — ഹെൽത്ത് ട്രാക്കറിൽ നിന്ന് പുരോഗതി സ്വയമേവ പുതുക്കും.' : 'Set targets for weight, BP, steps, HbA1c and more — progress updates automatically from your health tracker.'}</p>

      {goals.length === 0 && <EmptyState message={ml ? 'ഇതുവരെ ലക്ഷ്യങ്ങളൊന്നുമില്ല. ഒരെണ്ണം ചേർക്കൂ.' : 'No goals yet. Add one to get started.'} />}
      <GoalsManager goals={goals} locale={locale} />

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ആരോഗ്യ ലക്ഷ്യങ്ങൾ വ്യക്തിഗത പ്രചോദനത്തിന് മാത്രം. ലക്ഷ്യങ്ങൾ നിശ്ചയിക്കുന്നതിന് മുമ്പ് ഡോക്ടറുമായി ചർച്ച ചെയ്യുക.' : 'Health goals are for personal motivation only. Discuss targets with your doctor before setting them.'}
      </div>
    </main>
  );
}
