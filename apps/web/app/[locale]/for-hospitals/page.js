// For Hospitals — hospital acquisition landing.

import { resolveLocale } from '@/lib/i18n';
import { TrustHero, TrustSection, FeatureCard, Steps, CtaBand } from '@/components/trust/TrustParts';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ആശുപത്രികൾക്കായി | MalayaliDoctor' : 'For Hospitals | MalayaliDoctor',
    description: ml ? 'നിങ്ങളുടെ ആശുപത്രി MalayaliDoctor-ൽ ലിസ്റ്റ് ചെയ്യൂ' : 'List your hospital on MalayaliDoctor and reach patients across Kerala.'
  };
}

export default async function ForHospitalsPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const benefits = [
    { icon: '✓', title: ml ? 'സൗജന്യ ലിസ്റ്റിംഗ്' : 'Free listing' },
    { icon: '✓', title: ml ? 'വെരിഫൈഡ് ബാഡ്ജ്' : 'Verified badge' },
    { icon: '✓', title: ml ? 'വിഭാഗം പ്രദർശനം' : 'Department showcase' },
    { icon: '✓', title: ml ? 'ഡോക്ടർ അഫിലിയേഷനുകൾ' : 'Doctor affiliations' },
    { icon: '✓', title: ml ? 'അപ്പോയിന്റ്മെന്റ് റൂട്ടിംഗ്' : 'Appointment routing' },
    { icon: '✓', title: ml ? 'രോഗി റിവ്യൂകൾ' : 'Patient reviews' }
  ];
  const steps = [
    { icon: '🏥', title: ml ? 'ആശുപത്രി വിവരങ്ങൾ സമർപ്പിക്കുക' : 'Submit hospital details' },
    { icon: '📄', title: ml ? 'രജിസ്ട്രേഷനും ലൈസൻസും അപ്‌ലോഡ് ചെയ്യുക' : 'Upload registration + license' },
    { icon: '🚀', title: ml ? 'വെരിഫൈ ചെയ്ത് ലൈവ് ആകുക' : 'Get verified and go live' }
  ];
  const requirements = ml
    ? ['രജിസ്ട്രേഷൻ സർട്ടിഫിക്കറ്റ്', 'ഓപ്പറേറ്റിംഗ് ലൈസൻസ്', 'കുറഞ്ഞത് 1 വെരിഫൈഡ് ഡോക്ടർ']
    : ['Registration certificate', 'Operating license', 'At least 1 verified doctor'];

  return (
    <div className="-my-6">
      <TrustHero
        title={ml ? 'നിങ്ങളുടെ ആശുപത്രി MalayaliDoctor-ൽ ലിസ്റ്റ് ചെയ്യൂ' : 'List your hospital on MalayaliDoctor'}
        subtitle={ml ? 'കേരളമെമ്പാടുമുള്ള രോഗികളിലേക്ക് എത്തിച്ചേരൂ' : 'Reach patients across Kerala'}
      />
      <TrustSection title={ml ? 'ആനുകൂല്യങ്ങൾ' : 'Benefits'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => <FeatureCard key={i} {...b} />)}
        </div>
      </TrustSection>
      <TrustSection title={ml ? 'എങ്ങനെ ചേരാം' : 'How to join'} tint="gray">
        <div className="mx-auto max-w-2xl"><Steps steps={steps} /></div>
      </TrustSection>
      <TrustSection title={ml ? 'ആവശ്യകതകൾ' : 'Requirements'}>
        <ul className="mx-auto max-w-2xl space-y-2">
          {requirements.map((r, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              <span className="text-brand">✓</span> {r}
            </li>
          ))}
        </ul>
      </TrustSection>
      <CtaBand text={ml ? 'ഇന്ന് തന്നെ പങ്കാളിയാകൂ' : 'Partner with us today'} buttonLabel={ml ? 'നിങ്ങളുടെ ആശുപത്രി രജിസ്ട്രർ ചെയ്യൂ →' : 'Register your hospital →'} href={`/${locale}/contact?subject=Hospital+Partnership`} />
    </div>
  );
}
