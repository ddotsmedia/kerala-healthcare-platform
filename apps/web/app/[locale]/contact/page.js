// Contact — trust page with email form.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { TrustHero, TrustSection, FeatureCard } from '@/components/trust/TrustParts';
import ContactForm from '@/components/trust/ContactForm';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ബന്ധപ്പെടുക | MalayaliDoctor' : 'Contact Us | MalayaliDoctor',
    description: ml ? 'MalayaliDoctor-മായി ബന്ധപ്പെടുക' : 'Get in touch with the MalayaliDoctor team.'
  };
}

export default async function ContactPage(props) {
  const { locale: raw } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const info = [
    { icon: '📧', title: ml ? 'ഇമെയിൽ' : 'Email', text: 'hello@malayalidoctor.com' },
    { icon: '🕐', title: ml ? 'മറുപടി' : 'Response', text: ml ? '24 മണിക്കൂറിനുള്ളിൽ' : 'Within 24 hours' },
    { icon: '🌐', title: ml ? 'ഭാഷ' : 'Language', text: ml ? 'മലയാളം & ഇംഗ്ലീഷ്' : 'Malayalam & English' }
  ];

  return (
    <div className="-my-6">
      <TrustHero title={ml ? 'ഞങ്ങളുമായി ബന്ധപ്പെടുക' : 'Contact Us'} />

      <TrustSection tint="gray">
        <div className="mx-auto max-w-2xl">
          <ContactForm locale={locale} initialSubject={sp.subject || ''} />
        </div>
      </TrustSection>

      <TrustSection>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {info.map((c, i) => <FeatureCard key={i} {...c} />)}
        </div>
      </TrustSection>

      <TrustSection title={ml ? 'ഹെൽത്ത്‌കെയർ പ്രൊവൈഡർമാർക്കായി' : 'For Healthcare Providers'} tint="gray">
        <p className="mx-auto mb-6 max-w-xl text-center text-sm text-gray-600">{ml ? 'നിങ്ങൾ ഒരു ഡോക്ടറോ ആശുപത്രിയോ ആണോ?' : 'Are you a doctor or hospital?'}</p>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href={`/${locale}/for-doctors`} className="rounded-2xl border border-brand bg-white p-6 text-center font-semibold text-brand shadow-sm hover:bg-teal-50">
            {ml ? 'ഡോക്ടറായി രജിസ്ട്രർ ചെയ്യുക →' : 'Register as a Doctor →'}
          </Link>
          <Link href={`/${locale}/for-hospitals`} className="rounded-2xl border border-brand bg-white p-6 text-center font-semibold text-brand shadow-sm hover:bg-teal-50">
            {ml ? 'ആശുപത്രി രജിസ്ട്രർ ചെയ്യുക →' : 'Register your Hospital →'}
          </Link>
        </div>
      </TrustSection>
    </div>
  );
}
