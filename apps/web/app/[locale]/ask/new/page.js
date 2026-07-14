// Ask a new question — form with pre-submit diagnosis checker. Requires login.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listSpecialties } from '@/lib/providers';
import AskForm from '@/components/qa/AskForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ചോദ്യം ചോദിക്കുക | MalayaliDoctor' : 'Ask a Question | MalayaliDoctor' };
}

export default async function AskNewPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  if (!(await currentPatientId())) redirect(`/${locale}/login?returnUrl=/${locale}/ask/new`);
  const specialties = await listSpecialties();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">✍️ {ml ? 'ചോദ്യം ചോദിക്കുക' : 'Ask a Question'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'പൊതുവായ ആരോഗ്യ ചോദ്യങ്ങൾ ചോദിക്കുക. വ്യക്തിഗത രോഗനിർണയത്തിന് ഒരു ഡോക്ടറെ നേരിട്ട് സമീപിക്കുക.' : 'Ask general health questions. For a personal diagnosis, consult a doctor directly.'}</p>
      <AskForm specialties={specialties} locale={locale} />
      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'അടിയന്തര സാഹചര്യങ്ങൾക്ക് ഇത് ഉപയോഗിക്കരുത് — 112/108 വിളിക്കുക. ഉത്തരങ്ങൾ വിദ്യാഭ്യാസപരം മാത്രം.' : 'Not for emergency situations — call 112/108. Answers are educational only.'}
      </div>
    </main>
  );
}
