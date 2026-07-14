// Patient↔doctor chat — unlocked only after the appointment is completed.
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { getPatientChat } from '@/lib/chat';
import ChatThread from '@/components/chat/ChatThread';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ഡോക്ടർ ചാറ്റ് | MalayaliDoctor' : 'Doctor Chat | MalayaliDoctor', robots: { index: false } };
}

export default async function ChatPage(props) {
  const { locale: raw, id } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  if (!(await currentPatientId())) redirect(`/${locale}/login?returnUrl=/${locale}/patient/appointments/${id}/chat`);
  const r = await getPatientChat(id);
  if (r.error === 'not_found') notFound();

  const disclaimer = (
    <div role="note" aria-label="chat-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
      {ml ? 'ഈ ചാറ്റ് ഫോളോ-അപ്പ് ചോദ്യങ്ങൾക്ക് മാത്രം. അടിയന്തര പ്രശ്നങ്ങൾക്ക് പുതിയ അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക അല്ലെങ്കിൽ അടിയന്തരഘട്ടത്തിൽ 112/108 വിളിക്കുക.' : 'This chat is for follow-up questions only. For urgent concerns, book a new appointment or call 112/108 in an emergency.'}
    </div>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/patient/appointments/${id}`} className="hover:text-brand">← {ml ? 'അപ്പോയിന്റ്മെന്റ്' : 'Appointment'}</Link>
      </nav>
      <h1 className="text-xl font-bold">💬 {ml ? 'ഡോക്ടറുമായി ചാറ്റ്' : 'Chat with your doctor'}{r.ctx ? ` — ${r.ctx.provider_name}` : ''}</h1>
      {disclaimer}

      {r.error === 'locked' ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          🔒 {ml ? 'അപ്പോയിന്റ്മെന്റ് പൂർത്തിയായതിന് ശേഷം മാത്രം ചാറ്റ് ലഭ്യമാകും.' : 'Chat unlocks after your appointment is completed.'}
        </div>
      ) : (
        <ChatThread apiBase={`/api/patient/appointments/${id}/chat`} initialMessages={r.messages} myUserId={r.uid} locale={locale} />
      )}
    </main>
  );
}
