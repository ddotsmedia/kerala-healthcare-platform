// Doctor self-registration — multi-step onboarding. Submits to a pending,
// draft profile that admins verify before it goes live.

import { resolveLocale } from '@/lib/i18n';
import { listSpecialties, listDistricts } from '@/lib/providers';
import DoctorRegisterForm from '@/components/register/DoctorRegisterForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ഡോക്ടർ രജിസ്ട്രേഷൻ | MalayaliDoctor' : 'Doctor Registration | MalayaliDoctor',
    description: ml
      ? 'MalayaliDoctor-ൽ നിങ്ങളുടെ പ്രൊഫൈൽ രജിസ്റ്റർ ചെയ്യൂ — 24-48 മണിക്കൂറിനുള്ളിൽ ലൈവ്.'
      : 'Register your profile on MalayaliDoctor — go live within 24-48 hours after verification.'
  };
}

export default async function DoctorRegisterPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const [specialties, districts] = await Promise.all([listSpecialties(), listDistricts()]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900">👨‍⚕️ {ml ? 'ഡോക്ടർ രജിസ്ട്രേഷൻ' : 'Doctor Registration'}</h1>
        <p className="mt-1 text-sm text-gray-600">{ml ? 'വെരിഫിക്കേഷന് ശേഷം 24-48 മണിക്കൂറിനുള്ളിൽ നിങ്ങളുടെ പ്രൊഫൈൽ ലൈവ് ആകും.' : 'Your profile goes live within 24-48 hours after verification.'}</p>
      </header>
      <DoctorRegisterForm locale={locale} specialties={specialties} districts={districts} />
    </main>
  );
}
