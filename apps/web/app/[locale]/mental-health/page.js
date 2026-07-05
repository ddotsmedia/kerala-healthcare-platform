// Mental Health Hub. Compassionate, non-diagnostic, crisis-forward.

import { resolveLocale } from '@/lib/i18n';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { TrustSection, FAQ } from '@/components/trust/TrustParts';
import { HubHero, TopicGrid, HelplineBand, Disclaimer } from '@/components/hubs/HubParts';
import WaitlistForm from '@/components/hubs/WaitlistForm';
import { DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'മാനസിക ആരോഗ്യം | MalayaliDoctor' : 'Mental Health | MalayaliDoctor',
    description: ml ? 'മാനസികാരോഗ്യ അവബോധവും പിന്തുണയും. നിങ്ങൾ ഒറ്റയ്ക്കല്ല.' : 'Mental health awareness and support. You are not alone.'
  };
}

export default async function MentalHealth(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const psy = await getSpecialtyBySlug('psychiatry');
  const doctors = psy ? await searchDoctors({ specialtyId: psy.id, page: 1, limit: 4 }) : [];

  const topics = [
    { icon: '😰', ml: 'സ്ട്രെസ്', en: 'Stress' }, { icon: '😟', ml: 'ഉത്കണ്ഠ', en: 'Anxiety' },
    { icon: '😔', ml: 'വിഷാദം', en: 'Depression' }, { icon: '😴', ml: 'ഉറക്കം', en: 'Sleep Health' },
    { icon: '🧘', ml: 'മൈൻഡ്ഫുൾനെസ്', en: 'Mindfulness' }, { icon: '🍺', ml: 'ആസക്തി', en: 'Addiction Support' },
    { icon: '👨‍👩‍👧', ml: 'കുടുംബ മാനസികാരോഗ്യം', en: 'Family Mental Health' }, { icon: '💼', ml: 'ജോലി സ്ട്രെസ്', en: 'Work Stress' }
  ].map((t) => ({ ...t, href: `/${locale}/health?category=mental-health` }));

  const selfHelp = [
    { q: ml ? '4-7-8 ശ്വസന വ്യായാമം' : '4-7-8 Breathing', a: ml ? '4 സെക്കൻഡ് ശ്വാസം എടുക്കുക, 7 സെക്കൻഡ് പിടിക്കുക, 8 സെക്കൻഡ് പുറത്തുവിടുക. 4 തവണ ആവർത്തിക്കുക.' : 'Breathe in for 4s, hold for 7s, exhale for 8s. Repeat 4 times.' },
    { q: ml ? '5-4-3-2-1 ഗ്രൗണ്ടിംഗ്' : '5-4-3-2-1 Grounding', a: ml ? 'കാണുന്ന 5 കാര്യങ്ങൾ, തൊടാവുന്ന 4, കേൾക്കുന്ന 3, മണക്കുന്ന 2, രുചിക്കുന്ന 1 എന്നിവ ശ്രദ്ധിക്കുക.' : 'Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.' },
    { q: ml ? 'ഉറക്ക ശുചിത്വം' : 'Sleep Hygiene', a: ml ? 'സ്ഥിരമായ ഉറക്ക സമയം, സ്ക്രീൻ ഒഴിവാക്കൽ, ശാന്തമായ മുറി — നല്ല ഉറക്കത്തിന് സഹായിക്കും.' : 'Consistent bedtime, no screens before bed, and a calm room help you sleep better.' }
  ];

  return (
    <div className="-my-6">
      <HubHero title={ml ? 'മാനസിക ആരോഗ്യം — ഒറ്റയ്ക്കല്ല' : 'Mental Health — You Are Not Alone'}
        subtitle={ml ? 'സഹായം തേടുന്നത് ബലഹീനതയല്ല.' : 'Reaching out is not a weakness.'}
        gradient="from-[#6366f1] to-[#8b5cf6]" />

      <HelplineBand tone="red" title={ml ? '🆘 ക്രൈസിസ് പിന്തുണ:' : '🆘 Crisis Support:'}
        lines={[{ label: 'iCall', number: '9152987821' }, { label: 'Vandrevala', number: '1860-2662-345' }, { label: ml ? 'കേരള' : 'Kerala SP', number: '0471-2552056' }]} />

      <TrustSection title={ml ? 'വിഷയങ്ങൾ' : 'Topics'}>
        <TopicGrid items={topics} locale={locale} />
      </TrustSection>

      <TrustSection title={ml ? 'എപ്പോൾ സഹായം തേടണം' : 'When to seek help'} tint="gray">
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-gray-700">
          {ml
            ? 'നിരന്തരമായ സങ്കടം, ഉറക്കമില്ലായ്മ, താൽപ്പര്യക്കുറവ്, അമിത ഉത്കണ്ഠ, ദൈനംദിന കാര്യങ്ങൾ ബുദ്ധിമുട്ടാകൽ — ഇവ അനുഭവപ്പെടുന്നുവെങ്കിൽ ദയവായി ഒരു പ്രൊഫഷണലിനോട് സംസാരിക്കുക. നിങ്ങൾ അമിതഭാരം അനുഭവിക്കുന്നുവെങ്കിൽ, ദയവായി ബന്ധപ്പെടുക.'
            : 'Persistent sadness, sleeplessness, loss of interest, overwhelming worry, or difficulty with daily tasks — if you feel these, please talk to a professional. If you feel overwhelmed, please reach out.'}
        </p>
      </TrustSection>

      {doctors.length > 0 && (
        <TrustSection title={ml ? 'സൈക്യാട്രിസ്റ്റുകൾ' : 'Psychiatrists & Psychologists'}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
        </TrustSection>
      )}

      <TrustSection title={ml ? 'സ്വയം സഹായ വിഭവങ്ങൾ' : 'Self-help resources'} tint="gray">
        <FAQ items={selfHelp} />
      </TrustSection>

      <TrustSection title={ml ? 'സപ്പോർട്ട് ഗ്രൂപ്പുകൾ' : 'Support groups'}>
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-sm text-gray-600">{ml ? 'കമ്മ്യൂണിറ്റി പിന്തുണ ഉടൻ വരുന്നു — വെയ്റ്റ്‌ലിസ്റ്റിൽ ചേരൂ' : 'Community support coming soon — join our waitlist'}</p>
          <WaitlistForm topic="mental-health-support" locale={locale} />
        </div>
      </TrustSection>

      <TrustSection>
        <Disclaimer>
          {ml
            ? 'ഈ ഉള്ളടക്കം അവബോധത്തിന് മാത്രം. നിങ്ങൾ പ്രതിസന്ധിയിലാണെങ്കിൽ ഉടൻ 9152987821 വിളിക്കുക. എപ്പോഴും യോഗ്യതയുള്ള മാനസികാരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക.'
            : 'This content is for awareness only. If you are in crisis, call 9152987821 immediately. Always consult a qualified mental health professional.'}
        </Disclaimer>
      </TrustSection>
    </div>
  );
}
