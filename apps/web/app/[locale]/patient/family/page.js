// Family health profiles — manage members under one account.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listFamily } from '@/lib/family';
import FamilyManager from '@/components/family/FamilyManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'കുടുംബ ആരോഗ്യ പ്രൊഫൈലുകൾ | MalayaliDoctor' : 'Family Health Profiles | MalayaliDoctor' };
}

export default async function FamilyPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/family`);
  const members = await listFamily(uid);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">👨‍👩‍👧 {ml ? 'കുടുംബ ആരോഗ്യ പ്രൊഫൈലുകൾ' : 'Family Health Profiles'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'ഭാര്യ/ഭർത്താവ്, കുട്ടികൾ, മാതാപിതാക്കൾ എന്നിവരുടെ ആരോഗ്യ രേഖകൾ ഒരു അക്കൗണ്ടിൽ കൈകാര്യം ചെയ്യുക.' : 'Manage health records for your spouse, children and parents from one account.'}</p>
      <FamilyManager members={members} locale={locale} />

      <div role="note" aria-label="privacy-note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'കുടുംബാംഗങ്ങളുടെ ആരോഗ്യ വിവരങ്ങൾ അവരുടെ സമ്മതത്തോടെ മാത്രം ചേർക്കുക. ഈ ഡാറ്റ നിങ്ങളുടെ അക്കൗണ്ടിൽ സ്വകാര്യമായി സൂക്ഷിക്കുന്നു.' : 'Add family members’ health information only with their consent. This data is stored privately under your account.'}
      </div>
    </main>
  );
}
