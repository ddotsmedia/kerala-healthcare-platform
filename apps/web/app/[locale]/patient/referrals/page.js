// Refer a friend — shareable link, WhatsApp share, referral status, how it works.

import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { myCode, myStats } from '@/lib/referrals';
import { SITE } from '@/components/landing/LandingParts';
import ReferralShare from '@/components/referrals/ReferralShare';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ഒരു സുഹൃത്തിനെ റഫർ ചെയ്യുക | MalayaliDoctor' : 'Refer a Friend | MalayaliDoctor',
    description: ml
      ? 'MalayaliDoctor സുഹൃത്തുക്കളുമായി പങ്കിടുക — അവർ ഡോക്ടറെ കണ്ടെത്തട്ടെ.'
      : 'Share MalayaliDoctor with friends and help them find the right doctor in Kerala.'
  };
}

const STEPS = [
  { icon: '🔗', ml: ['ലിങ്ക് പങ്കിടുക', 'നിങ്ങളുടെ റഫറൽ ലിങ്ക് സുഹൃത്തുക്കൾക്ക് അയയ്ക്കുക.'], en: ['Share your link', 'Send your referral link to friends and family.'] },
  { icon: '📝', ml: ['സുഹൃത്ത് ചേരുന്നു', 'അവർ ലിങ്ക് വഴി രജിസ്റ്റർ ചെയ്യുന്നു.'], en: ['Friend joins', 'They register through your link.'] },
  { icon: '🩺', ml: ['അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുന്നു', 'അവർ ആദ്യ അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുമ്പോൾ രണ്ടുപേർക്കും ആനുകൂല്യം.'], en: ['They book a visit', 'When they book their first appointment, you both get benefits.'] }
];

function Stat({ n, label }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
      <div className="text-2xl font-extrabold text-brand">{n}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function ReferralsPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/referrals`);

  const [code, stats] = await Promise.all([myCode(uid), myStats(uid)]);
  const link = code ? `${SITE}/${locale}/register?ref=${code}` : null;

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-xl font-bold">🎁 {ml ? 'ഒരു സുഹൃത്തിനെ MalayaliDoctor-ലേക്ക് റഫർ ചെയ്യുക' : 'Refer a Friend to MalayaliDoctor'}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {ml
            ? 'കേരളത്തിലെ ഏറ്റവും അനുയോജ്യമായ ഡോക്ടറെ കണ്ടെത്താൻ സുഹൃത്തുക്കളെ സഹായിക്കൂ.'
            : 'Help friends and family find the right doctor in Kerala.'}
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {link
          ? <ReferralShare link={link} locale={locale} />
          : <p className="text-sm text-gray-500">{ml ? 'റഫറൽ ലിങ്ക് തയ്യാറാക്കാൻ കഴിഞ്ഞില്ല. പിന്നീട് ശ്രമിക്കുക.' : 'Could not create your referral link. Please try again later.'}</p>}
      </section>

      <section aria-label={ml ? 'റഫറൽ നില' : 'Referral status'}>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'നിങ്ങളുടെ റഫറൽ നില' : 'Your referral status'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat n={stats.joined} label={ml ? 'സുഹൃത്തുക്കൾ ചേർന്നു' : 'Friends joined'} />
          <Stat n={stats.booked} label={ml ? 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്തു' : 'Booked an appointment'} />
        </div>
      </section>

      <section aria-label={ml ? 'എങ്ങനെ പ്രവർത്തിക്കുന്നു' : 'How it works'}>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'എങ്ങനെ പ്രവർത്തിക്കുന്നു — 3 ലളിതമായ ഘട്ടങ്ങൾ' : 'How it works — 3 simple steps'}</h2>
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const [title, body] = ml ? s.ml : s.en;
            return (
              <li key={i} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <span aria-hidden="true" className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{i + 1}. {title}</p>
                  <p className="text-xs text-gray-600">{body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div role="note" aria-label="referral-terms" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml
          ? 'റഫറൽ ആനുകൂല്യങ്ങൾ പ്ലാറ്റ്ഫോം സേവനങ്ങൾക്ക് മാത്രമുള്ളതാണ് — ചികിത്സയുമായി ബന്ധപ്പെട്ട ഒരു വാഗ്ദാനവുമല്ല. ആരോഗ്യ കാര്യങ്ങൾക്ക് യോഗ്യതയുള്ള ഡോക്ടറെ സമീപിക്കുക.'
          : 'Referral benefits apply to platform services only and are not an offer or inducement relating to medical treatment. Always consult a qualified doctor for health matters.'}
      </div>
    </main>
  );
}
