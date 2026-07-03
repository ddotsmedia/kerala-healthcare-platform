// How It Works — trust page with FAQ (FAQPage JSON-LD).

import { resolveLocale } from '@/lib/i18n';
import { TrustHero, TrustSection, Steps, FAQ, CtaBand } from '@/components/trust/TrustParts';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'എങ്ങനെ ഉപയോഗിക്കാം | MalayaliDoctor' : 'How It Works | MalayaliDoctor',
    description: ml ? 'MalayaliDoctor ഉപയോഗിക്കുന്ന വിധം' : 'How to use MalayaliDoctor — patients and doctors.'
  };
}

export default async function HowItWorksPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const patientSteps = [
    { icon: '🔍', title: ml ? 'ഡോക്ടറെ തിരയുക' : 'Search for a doctor', text: ml ? 'പേര്, സ്പെഷ്യാലിറ്റി, ജില്ല, ഭാഷ എന്നിവ അനുസരിച്ച്' : 'By name, specialty, district, language' },
    { icon: '👤', title: ml ? 'പ്രൊഫൈൽ പരിശോധിക്കുക' : 'Check the profile', text: ml ? 'യോഗ്യതകൾ, അനുഭവം, റിവ്യൂകൾ, ഫീസ്' : 'Qualifications, experience, reviews, fee' },
    { icon: '📅', title: ml ? 'സ്ലോട്ട് തിരഞ്ഞെടുക്കുക' : 'Choose a slot', text: ml ? 'തീയതി, സമയം, കൺസൾട്ടേഷൻ രീതി' : 'Date, time, consultation mode' },
    { icon: '✅', title: ml ? 'ബുക്കിംഗ് സ്ഥിരീകരിക്കുക' : 'Confirm the booking', text: ml ? 'SMS/ഇമെയിൽ സ്ഥിരീകരണം' : 'Get SMS/email confirmation' },
    { icon: '🏥', title: ml ? 'കൺസൾട്ടേഷൻ' : 'Consultation', text: ml ? 'നേരിട്ട് വരൂ അല്ലെങ്കിൽ വീഡിയോ കോൾ' : 'Visit in-person or join a video call' }
  ];
  const doctorSteps = [
    { icon: '📝', title: ml ? 'രജിസ്ട്രർ ചെയ്യുക' : 'Register' },
    { icon: '✓', title: ml ? 'വെരിഫിക്കേഷൻ' : 'Verification' },
    { icon: '📅', title: ml ? 'ലഭ്യത സജ്ജമാക്കുക' : 'Set availability' },
    { icon: '🤝', title: ml ? 'രോഗികളെ കാണുക' : 'See patients' }
  ];
  const faq = [
    { q: ml ? 'രോഗികൾക്ക് ഇത് സൗജന്യമാണോ?' : 'Is it free for patients?', a: ml ? 'അതെ, പൂർണ്ണമായും സൗജന്യം.' : 'Yes, completely free.' },
    { q: ml ? 'ഡോക്ടർമാരെ എങ്ങനെ വെരിഫൈ ചെയ്യുന്നു?' : 'How are doctors verified?', a: ml ? 'NMC രജിസ്ട്രേഷനും രേഖ പരിശോധനയും വഴി.' : 'NMC registration + document verification.' },
    { q: ml ? 'അതേ ദിവസം അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാമോ?' : 'Can I book same-day appointments?', a: ml ? 'അതെ, ലഭ്യത അനുസരിച്ച്.' : 'Yes, based on availability.' },
    { q: ml ? 'എന്റെ ആരോഗ്യ ഡാറ്റ സുരക്ഷിതമാണോ?' : 'Is my health data secure?', a: ml ? 'അതെ, DPDP Act 2023 അനുസൃതം.' : 'Yes, DPDP Act 2023 compliant.' },
    { q: ml ? 'റദ്ദാക്കണമെങ്കിൽ?' : 'What if I need to cancel?', a: ml ? '2 മണിക്കൂർ മുൻപ് വരെ സൗജന്യ റദ്ദാക്കൽ.' : 'Free cancellation up to 2 hours before.' },
    { q: ml ? 'ഓൺലൈൻ കൺസൾട്ടേഷൻ ലഭ്യമാണോ?' : 'Are online consultations available?', a: ml ? 'അതെ, വീഡിയോ, ഫോൺ കൺസൾട്ടേഷനുകൾ.' : 'Yes, video and phone consultations.' },
    { q: ml ? 'ഡോക്ടർ യഥാർത്ഥമാണോ എന്ന് എങ്ങനെ അറിയാം?' : 'How do I know if a doctor is genuine?', a: ml ? 'പച്ച വെരിഫൈഡ് ബാഡ്ജ് = NMC വെരിഫൈഡ്.' : 'Green Verified badge = NMC verified.' },
    { q: ml ? 'ഏതൊക്കെ ഭാഷകൾ പിന്തുണയ്ക്കുന്നു?' : 'What languages are supported?', a: ml ? 'മലയാളവും ഇംഗ്ലീഷും.' : 'Malayalam and English.' }
  ];

  return (
    <div className="-my-6">
      <TrustHero title={ml ? 'MalayaliDoctor ഉപയോഗിക്കുന്നത് എളുപ്പം' : 'Using MalayaliDoctor is easy'} />

      <TrustSection title={ml ? 'രോഗികൾക്കായി' : 'For Patients'}>
        <div className="mx-auto max-w-2xl"><Steps steps={patientSteps} /></div>
      </TrustSection>

      <TrustSection title={ml ? 'ഡോക്ടർമാർക്കായി' : 'For Doctors'} tint="gray">
        <div className="mx-auto max-w-2xl"><Steps steps={doctorSteps} /></div>
      </TrustSection>

      <TrustSection title={ml ? 'പതിവ് ചോദ്യങ്ങൾ' : 'Frequently Asked Questions'}>
        <FAQ items={faq} />
      </TrustSection>

      <CtaBand text={ml ? 'ഇപ്പോൾ ആരംഭിക്കൂ' : 'Get started now'} buttonLabel={ml ? 'ഡോക്ടറെ കണ്ടെത്തൂ →' : 'Find a doctor →'} href={`/${locale}/doctors`} />
    </div>
  );
}
