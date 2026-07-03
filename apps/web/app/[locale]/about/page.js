// About Us — trust page.

import { resolveLocale } from '@/lib/i18n';
import { TrustHero, TrustSection, FeatureCard, StatStrip, CtaBand } from '@/components/trust/TrustParts';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ഞങ്ങളെ കുറിച്ച് | MalayaliDoctor' : 'About Us | MalayaliDoctor',
    description: "Kerala's largest healthcare platform connecting patients with verified doctors and hospitals."
  };
}

export default async function AboutPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const features = [
    { icon: '🏥', title: ml ? 'ഡോക്ടർ ഡയറക്ടറി' : 'Doctor Directory', text: ml ? 'വെരിഫൈഡ് പ്രൊഫൈലുകൾ, സ്പെഷ്യാലിറ്റികൾ' : 'Verified profiles, specialties' },
    { icon: '📅', title: ml ? 'അപ്പോയിന്റ്മെന്റുകൾ' : 'Appointments', text: ml ? 'ഓൺലൈൻ ബുക്കിംഗ്, കാത്തിരിപ്പില്ല' : 'Book online, no waiting' },
    { icon: '📚', title: ml ? 'ആരോഗ്യ വിജ്ഞാനം' : 'Health Knowledge', text: ml ? 'മലയാളത്തിൽ ആരോഗ്യ വിദ്യാഭ്യാസം' : 'Malayalam health education' },
    { icon: '💼', title: ml ? 'ഹെൽത്ത്‌കെയർ ജോലികൾ' : 'Healthcare Jobs', text: ml ? 'പ്രൊഫഷണലുകളെ ബന്ധിപ്പിക്കുന്നു' : 'Connecting professionals' }
  ];
  const stats = [
    { value: '10,000+', label: ml ? 'ഡോക്ടർമാർ' : 'Doctors' },
    { value: '500+', label: ml ? 'ആശുപത്രികൾ' : 'Hospitals' },
    { value: '14', label: ml ? 'ജില്ലകൾ' : 'Districts' },
    { value: '50,000+', label: ml ? 'അപ്പോയിന്റ്മെന്റുകൾ' : 'Appointments' },
    { value: '100%', label: ml ? 'രോഗികൾക്ക് സൗജന്യം' : 'Free for Patients' }
  ];
  const values = [
    { icon: '🔒', title: ml ? 'വിശ്വാസം' : 'Trust', text: ml ? 'വെരിഫൈഡ് ഹെൽത്ത്‌കെയർ പ്രൊവൈഡർമാർ മാത്രം' : 'Only verified healthcare providers' },
    { icon: '🌿', title: ml ? 'പരിചരണം' : 'Care', text: ml ? 'എപ്പോഴും രോഗി-കേന്ദ്രീകൃത സമീപനം' : 'Patient-first approach always' },
    { icon: '📖', title: ml ? 'വിദ്യാഭ്യാസം' : 'Education', text: ml ? 'മലയാളത്തിൽ ആരോഗ്യ സാക്ഷരത' : 'Health literacy in Malayalam' }
  ];
  const team = [
    ml ? 'ഹെൽത്ത്‌കെയർ പ്രൊഫഷണലുകൾ' : 'Healthcare Professionals',
    ml ? 'സാങ്കേതിക വിദഗ്ധർ' : 'Technologists',
    ml ? 'കണ്ടന്റ് & കമ്മ്യൂണിറ്റി' : 'Content & Community'
  ];

  return (
    <div className="-my-6">
      <TrustHero
        title={ml ? 'കേരളത്തിന്റെ ആരോഗ്യ സേവനം ഡിജിറ്റൽ ആക്കുന്നു' : 'Digitising healthcare for Kerala'}
        subtitle={ml
          ? 'വെരിഫൈഡ് ഡോക്ടർമാരെയും ആശുപത്രികളെയും രോഗികളുമായി ബന്ധിപ്പിക്കുന്ന കേരളത്തിലെ ഏറ്റവും വലിയ ആരോഗ്യ പ്ലാറ്റ്ഫോം'
          : "Kerala's largest platform connecting patients with verified doctors and hospitals"}
      />

      <TrustSection tint="gray">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand">{ml ? 'ദൗത്യം' : 'Mission'}</h3>
            <p className="mt-2 text-base text-gray-800">{ml ? 'കേരളത്തിലെ എല്ലാ രോഗികൾക്കും ഏറ്റവും മികച്ച ഡോക്ടറെ കണ്ടെത്താൻ സഹായിക്കുക' : 'Help every patient in Kerala find the best doctor'}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand">{ml ? 'കാഴ്ചപ്പാട്' : 'Vision'}</h3>
            <p className="mt-2 text-base text-gray-800">{ml ? "ഇന്ത്യയിലെ ഏറ്റവും വിശ്വസനീയമായ മലയാളം-ആദ്യ ആരോഗ്യ ആവാസവ്യവസ്ഥ" : "India's most trusted Malayalam-first healthcare ecosystem"}</p>
          </div>
        </div>
      </TrustSection>

      <TrustSection title={ml ? 'ഞങ്ങൾ ചെയ്യുന്നത്' : 'What We Do'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </TrustSection>

      <TrustSection tint="teal">
        <StatStrip stats={stats} />
      </TrustSection>

      <TrustSection title={ml ? 'ഞങ്ങളുടെ മൂല്യങ്ങൾ' : 'Our Values'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {values.map((v, i) => <FeatureCard key={i} {...v} />)}
        </div>
      </TrustSection>

      <TrustSection title={ml ? 'ഞങ്ങളുടെ ടീം' : 'Our Team'} tint="gray">
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-gray-600">
          {ml ? 'കേരളത്തിലെ ആരോഗ്യ പ്രവേശനം മെച്ചപ്പെടുത്താൻ പ്രവർത്തിക്കുന്ന ഹെൽത്ത്‌കെയർ പ്രൊഫഷണലുകളുടെയും സാങ്കേതിക വിദഗ്ധരുടെയും ടീം' : 'Our team of healthcare professionals and technologists working to improve healthcare access in Kerala'}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {team.map((role, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-16 w-16 rounded-full bg-teal-50" />
              <div className="mt-3 text-sm font-semibold text-gray-900">{role}</div>
            </div>
          ))}
        </div>
      </TrustSection>

      <CtaBand
        text={ml ? 'ചോദ്യങ്ങളുണ്ടോ? ഞങ്ങൾ കേൾക്കാൻ ആഗ്രഹിക്കുന്നു' : "Questions? We'd love to hear from you"}
        buttonLabel={ml ? 'ബന്ധപ്പെടുക →' : 'Contact us →'}
        href={`/${locale}/contact`}
      />
    </div>
  );
}
