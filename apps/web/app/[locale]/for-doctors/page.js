// For Doctors — provider acquisition landing.

import { resolveLocale } from '@/lib/i18n';
import { TrustHero, TrustSection, FeatureCard, Steps, CtaBand } from '@/components/trust/TrustParts';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ഡോക്ടർമാർക്കായി | MalayaliDoctor' : 'For Doctors | MalayaliDoctor',
    description: ml ? 'MalayaliDoctor-ൽ നിങ്ങളുടെ പ്രൊഫൈൽ സൃഷ്ടിക്കൂ' : 'Create your profile on MalayaliDoctor and reach patients across Kerala.'
  };
}

export default async function ForDoctorsPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const benefits = [
    { icon: '✓', title: ml ? 'സൗജന്യ പ്രൊഫൈൽ ലിസ്റ്റിംഗ്' : 'Free profile listing' },
    { icon: '✓', title: ml ? 'വെരിഫൈഡ് ബാഡ്ജ് വിശ്വാസം നൽകുന്നു' : 'Verified badge builds trust' },
    { icon: '✓', title: ml ? 'ഓൺലൈൻ അപ്പോയിന്റ്മെന്റ് ബുക്കിംഗ്' : 'Online appointment booking' },
    { icon: '✓', title: ml ? 'രോഗി മാനേജ്മെന്റ് ഡാഷ്ബോർഡ്' : 'Patient management dashboard' },
    { icon: '✓', title: ml ? 'വീഡിയോ കൺസൾട്ടേഷൻ പിന്തുണ' : 'Video consultation support' },
    { icon: '✓', title: ml ? 'അനലിറ്റിക്സും ഇൻസൈറ്റുകളും' : 'Analytics and insights' }
  ];
  const steps = [
    { icon: '📱', title: ml ? 'മൊബൈൽ/ഇമെയിൽ ഉപയോഗിച്ച് അക്കൗണ്ട് സൃഷ്ടിക്കുക' : 'Create account with mobile/email' },
    { icon: '📄', title: ml ? 'യോഗ്യതകളും NMC നമ്പറും സമർപ്പിക്കുക' : 'Submit qualifications + NMC number' },
    { icon: '🚀', title: ml ? 'വെരിഫൈ ചെയ്യുക — 24-48 മണിക്കൂറിനുള്ളിൽ ലൈവ്' : 'Get verified — go live in 24-48 hours' }
  ];
  const requirements = ml
    ? ['സാധുവായ മെഡിക്കൽ രജിസ്ട്രേഷൻ (NMC/സ്റ്റേറ്റ് കൗൺസിൽ)', 'MBBS അല്ലെങ്കിൽ തത്തുല്യ യോഗ്യത', 'സാധുവായ ഫോട്ടോ ഐഡി']
    : ['Valid medical registration (NMC/State council)', 'MBBS or equivalent qualification', 'Valid photo ID'];

  return (
    <div className="-my-6">
      <TrustHero
        title={ml ? 'MalayaliDoctor-ൽ നിങ്ങളുടെ പ്രൊഫൈൽ സൃഷ്ടിക്കൂ' : 'Create your profile on MalayaliDoctor'}
        subtitle={ml ? '10,000+ രോഗികൾ ദിവസവും ഡോക്ടറെ തിരയുന്നു' : '10,000+ patients search for doctors every day'}
      />
      <TrustSection title={ml ? 'ആനുകൂല്യങ്ങൾ' : 'Benefits'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => <FeatureCard key={i} {...b} />)}
        </div>
      </TrustSection>
      <TrustSection title={ml ? 'എങ്ങനെ രജിസ്ട്രർ ചെയ്യാം' : 'How to register'} tint="gray">
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
      <CtaBand text={ml ? 'ഇന്ന് തന്നെ ചേരൂ' : 'Join today'} buttonLabel={ml ? 'ഇപ്പോൾ രജിസ്ട്രർ ചെയ്യുക →' : 'Register now →'} href={`/${locale}/register?role=doctor`} />
    </div>
  );
}
