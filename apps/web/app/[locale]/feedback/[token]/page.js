// Post-appointment feedback page. Public — the token authorises access.
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getByFeedbackToken } from '@khp/appointments';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ഫീഡ്‌ബാക്ക് | MalayaliDoctor' : 'Appointment Feedback | MalayaliDoctor', robots: { index: false } };
}

export default async function FeedbackPage(props) {
  const { locale: raw, token } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const appt = await getByFeedbackToken(token);
  if (!appt) notFound();

  const initialRating = [1, 2, 3, 4, 5].includes(parseInt(sp.rating, 10)) ? parseInt(sp.rating, 10) : 0;
  const done = !!appt.feedback_completed_at;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-center text-xl font-bold text-gray-900">
        {ml ? `${appt.provider_name} എന്നയാളുമായുള്ള നിങ്ങളുടെ സന്ദർശനം എങ്ങനെയായിരുന്നു?` : `How was your visit with Dr. ${appt.provider_name}?`}
      </h1>
      <p className="mt-1 text-center text-sm text-gray-500">{ml ? 'റഫ്' : 'Ref'}: {appt.booking_ref}</p>

      <div className="mt-5">
        {done ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <div className="text-3xl">🙏</div>
            <p className="mt-2 font-semibold text-green-800">{ml ? 'ഈ സന്ദർശനത്തിന് നിങ്ങൾ ഇതിനകം ഫീഡ്‌ബാക്ക് നൽകി. നന്ദി!' : 'You have already submitted feedback for this visit. Thank you!'}</p>
          </div>
        ) : (
          <FeedbackForm token={token} initialRating={initialRating} locale={locale} />
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        {ml ? 'നിങ്ങളുടെ റിവ്യൂ മോഡറേഷന് ശേഷം പ്രസിദ്ധീകരിക്കും.' : 'Your review is published after moderation.'}
      </p>
    </main>
  );
}
