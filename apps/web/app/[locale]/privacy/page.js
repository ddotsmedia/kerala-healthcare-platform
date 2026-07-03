// Privacy Policy.

import { resolveLocale } from '@/lib/i18n';
import { ProseDoc } from '@/components/trust/TrustParts';

const UPDATED = '2026-07-03';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'സ്വകാര്യതാ നയം | MalayaliDoctor' : 'Privacy Policy | MalayaliDoctor' };
}

export default async function PrivacyPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const sections = [
    { heading: ml ? 'ഞങ്ങൾ ശേഖരിക്കുന്ന ഡാറ്റ' : 'What data we collect',
      paras: [ml ? 'പേര്, മൊബൈൽ നമ്പർ, ഇമെയിൽ, അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ, ആരോഗ്യ അന്വേഷണങ്ങൾ എന്നിവ ഞങ്ങൾ ശേഖരിക്കുന്നു.' : 'We collect your name, mobile number, email, appointment details, and health queries.']},
    { heading: ml ? 'ഞങ്ങൾ അത് എങ്ങനെ ഉപയോഗിക്കുന്നു' : 'How we use it',
      paras: [ml ? 'സേവന വിതരണത്തിനായി മാത്രം — അപ്പോയിന്റ്മെന്റുകൾ, ഓർമ്മപ്പെടുത്തലുകൾ, പിന്തുണ. ഞങ്ങൾ നിങ്ങളുടെ ഡാറ്റ വിൽക്കുന്നില്ല.' : 'Only for service delivery — appointments, reminders, and support. We never sell your data.']},
    { heading: ml ? 'DPDP Act 2023 അനുസൃതം' : 'DPDP Act 2023 compliance',
      paras: [ml ? 'ഇന്ത്യയുടെ ഡിജിറ്റൽ പേഴ്സണൽ ഡാറ്റ പ്രൊട്ടക്ഷൻ ആക്ട് 2023 അനുസരിച്ചാണ് ഞങ്ങൾ ഡാറ്റ കൈകാര്യം ചെയ്യുന്നത്.' : 'We process personal data in accordance with India’s Digital Personal Data Protection Act, 2023.']},
    { heading: ml ? 'ഡാറ്റ നിലനിർത്തൽ' : 'Data retention',
      paras: [ml ? 'സേവനത്തിന് ആവശ്യമുള്ളിടത്തോളം അല്ലെങ്കിൽ നിയമം അനുശാസിക്കുന്നിടത്തോളം മാത്രം ഞങ്ങൾ ഡാറ്റ സൂക്ഷിക്കുന്നു.' : 'We retain data only as long as needed for the service or as required by law.']},
    { heading: ml ? 'നിങ്ങളുടെ അവകാശങ്ങൾ' : 'Your rights',
      paras: [[ml ? 'നിങ്ങളുടെ ഡാറ്റ ആക്സസ് ചെയ്യാൻ' : 'Access your data', ml ? 'തിരുത്തലുകൾ അഭ്യർത്ഥിക്കാൻ' : 'Request corrections', ml ? 'ഇല്ലാതാക്കൽ അഭ്യർത്ഥിക്കാൻ' : 'Request deletion']]},
    { heading: ml ? 'സ്വകാര്യതാ ആശങ്കകൾ' : 'Privacy concerns',
      paras: [ml ? 'സ്വകാര്യത സംബന്ധമായ ചോദ്യങ്ങൾക്ക് ചുവടെയുള്ള ഇമെയിലിൽ ബന്ധപ്പെടുക.' : 'For privacy questions, contact us at the email below.']}
  ];

  return (
    <div className="-my-6">
      <ProseDoc title={ml ? 'സ്വകാര്യതാ നയം' : 'Privacy Policy'} lastUpdated={UPDATED} locale={locale}
        contactEmail="privacy@malayalidoctor.com" sections={sections} />
    </div>
  );
}
