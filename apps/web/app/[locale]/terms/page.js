// Terms of Service.

import { resolveLocale } from '@/lib/i18n';
import { ProseDoc } from '@/components/trust/TrustParts';

const UPDATED = '2026-07-03';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'സേവന നിബന്ധനകൾ | MalayaliDoctor' : 'Terms of Service | MalayaliDoctor' };
}

export default async function TermsPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const sections = [
    { heading: ml ? 'വിവരങ്ങൾ മാത്രം, വൈദ്യോപദേശമല്ല' : 'Information only, not medical advice',
      paras: [ml ? 'ഈ പ്ലാറ്റ്ഫോം ആരോഗ്യ വിവരങ്ങളും ഡയറക്ടറി സേവനവും നൽകുന്നു. ഇത് വൈദ്യോപദേശത്തിന് പകരമല്ല.' : 'This platform provides health information and directory services. It is not a substitute for professional medical advice.']},
    { heading: ml ? 'ഉപയോക്തൃ ഉത്തരവാദിത്തങ്ങൾ' : 'User responsibilities',
      paras: [ml ? 'കൃത്യമായ വിവരങ്ങൾ നൽകുക, അക്കൗണ്ട് സുരക്ഷിതമായി സൂക്ഷിക്കുക, പ്ലാറ്റ്ഫോം നിയമപരമായി ഉപയോഗിക്കുക.' : 'Provide accurate information, keep your account secure, and use the platform lawfully.']},
    { heading: ml ? 'പ്രൊവൈഡർ ഉത്തരവാദിത്തങ്ങൾ' : 'Provider responsibilities',
      paras: [ml ? 'ഡോക്ടർമാരും ആശുപത്രികളും സാധുവായ യോഗ്യതകളും കൃത്യമായ പ്രൊഫൈൽ വിവരങ്ങളും ഉറപ്പാക്കണം.' : 'Doctors and hospitals must maintain valid credentials and accurate profile information.']},
    { heading: ml ? 'ബുക്കിംഗും റദ്ദാക്കലും' : 'Booking and cancellation',
      paras: [ml ? 'അപ്പോയിന്റ്മെന്റുകൾ ലഭ്യതയ്ക്ക് വിധേയമാണ്. 2 മണിക്കൂർ മുൻപ് വരെ സൗജന്യ റദ്ദാക്കൽ.' : 'Appointments are subject to availability. Free cancellation up to 2 hours before.']},
    { heading: ml ? 'ബൗദ്ധിക സ്വത്ത്' : 'Intellectual property',
      paras: [ml ? 'പ്ലാറ്റ്ഫോമിലെ ഉള്ളടക്കവും ബ്രാൻഡിംഗും MalayaliDoctor-ന്റെ സ്വത്താണ്.' : 'Platform content and branding are the property of MalayaliDoctor.']},
    { heading: ml ? 'ബാധ്യതാ പരിമിതി' : 'Limitation of liability',
      paras: [ml ? 'ക്ലിനിക്കൽ ഫലങ്ങൾക്കോ പ്രൊവൈഡർ സേവനങ്ങൾക്കോ ഞങ്ങൾ ബാധ്യസ്ഥരല്ല. പ്ലാറ്റ്ഫോം "ഉള്ളപടി" നൽകുന്നു.' : 'We are not liable for clinical outcomes or provider services. The platform is provided “as is”.']},
    { heading: ml ? 'ഭരണ നിയമം' : 'Governing law',
      paras: [ml ? 'ഈ നിബന്ധനകൾ ഇന്ത്യൻ നിയമപ്രകാരം നിയന്ത്രിക്കപ്പെടുന്നു.' : 'These terms are governed by the laws of India.']}
  ];

  return (
    <div className="-my-6">
      <ProseDoc title={ml ? 'സേവന നിബന്ധനകൾ' : 'Terms of Service'} lastUpdated={UPDATED} locale={locale} sections={sections} />
    </div>
  );
}
