// Senior Care Portal. Large, calm, accessible.

import { resolveLocale } from '@/lib/i18n';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { TrustSection, FAQ } from '@/components/trust/TrustParts';
import { HubHero, TopicGrid, Disclaimer } from '@/components/hubs/HubParts';
import WaitlistForm from '@/components/hubs/WaitlistForm';
import LargeTextToggle from '@/components/hubs/LargeTextToggle';
import { DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'മുതിർന്നവരുടെ ആരോഗ്യം | MalayaliDoctor' : 'Senior Care | MalayaliDoctor' };
}

export default async function SeniorCare(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const gp = await getSpecialtyBySlug('general-physician');
  const doctors = gp ? await searchDoctors({ specialtyId: gp.id, page: 1, limit: 4 }) : [];

  const topics = [
    { icon: '❤️', ml: 'ഹൃദയാരോഗ്യം', en: 'Heart Health' }, { icon: '🦴', ml: 'എല്ലും സന്ധിയും', en: 'Bone & Joint' },
    { icon: '🧠', ml: 'ഓർമ്മ & ഡിമെൻഷ്യ', en: 'Memory & Dementia' }, { icon: '👁️', ml: 'കാഴ്ച', en: 'Vision' },
    { icon: '👂', ml: 'കേൾവി', en: 'Hearing' }, { icon: '💊', ml: 'പ്രമേഹ പരിചരണം', en: 'Diabetes' },
    { icon: '🩸', ml: 'രക്തസമ്മർദ്ദം', en: 'Blood Pressure' }, { icon: '🚶', ml: 'വീഴ്ച തടയൽ', en: 'Fall Prevention' }
  ].map((t) => ({ ...t, href: `/${locale}/health` }));

  const caregiver = [
    { q: ml ? 'നിങ്ങൾ ഒരു caregiver ആണോ?' : 'Are you a caregiver?', a: ml ? 'വിശ്രമം എടുക്കുക, സഹായം തേടുക, നിങ്ങളുടെ ആരോഗ്യവും ശ്രദ്ധിക്കുക. ബേൺഔട്ട് യഥാർത്ഥമാണ്.' : 'Take breaks, ask for help, and mind your own health too. Burnout is real.' },
    { q: ml ? 'മരുന്ന് മാനേജ്മെന്റ്' : 'Medication management', a: ml ? 'പിൽ ഓർഗനൈസർ ഉപയോഗിക്കുക, ഇടപെടലുകൾ ശ്രദ്ധിക്കുക. എല്ലാ മരുന്നുകളുടെയും പട്ടിക എപ്പോഴും ഡോക്ടറെ കാണിക്കുക.' : 'Use a pill organiser, watch for interactions. Always show your doctor a list of all medications you take.' },
    { q: ml ? 'വീഴ്ച തടയൽ ഗൈഡ്' : 'Fall prevention guide', a: ml ? 'തെന്നാത്ത തറ, നല്ല വെളിച്ചം, ഗ്രാബ് ബാർ, ബാലൻസ് വ്യായാമം, ആവശ്യമെങ്കിൽ വാക്കിംഗ് എയ്ഡ്.' : 'Non-slip floors, good lighting, grab bars, balance exercises, and walking aids when needed.' }
  ];

  return (
    <div className="-my-6 text-lg">
      <HubHero title={ml ? 'മുതിർന്നവർക്കായുള്ള ആരോഗ്യ സേവനം' : 'Health Care for Seniors'} gradient="from-sky-500 to-blue-600" large />

      <TrustSection>
        <div className="flex justify-center"><LargeTextToggle locale={locale} /></div>
      </TrustSection>

      <TrustSection title={ml ? 'പ്രധാന ആരോഗ്യ വിഷയങ്ങൾ' : 'Key health concerns'}>
        <TopicGrid items={topics} locale={locale} />
      </TrustSection>

      {doctors.length > 0 && (
        <TrustSection title={ml ? 'വിദഗ്ധ ഡോക്ടർമാർ' : 'Specialists'} tint="gray">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
        </TrustSection>
      )}

      <TrustSection title={ml ? 'ഹോം നഴ്സിംഗ് സേവനം' : 'Home Nursing'}>
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-gray-600">{ml ? 'ഹോം നഴ്സിംഗ് ഉടൻ വരുന്നു — താൽപ്പര്യം രജിസ്റ്റർ ചെയ്യൂ' : 'Home nursing coming soon — register your interest'}</p>
          <WaitlistForm topic="home-nursing" locale={locale} />
        </div>
      </TrustSection>

      <TrustSection title={ml ? 'കെയർഗിവർ വിഭവങ്ങൾ' : 'Caregiver resources'} tint="gray">
        <FAQ items={caregiver} />
      </TrustSection>

      <TrustSection>
        <Disclaimer>{ml ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രം. ഡോക്ടറെ സമീപിക്കുക.' : 'This information is for education only. Consult a doctor.'}</Disclaimer>
      </TrustSection>
    </div>
  );
}
