// PHR dashboard page. Patient auth required; own data only.

import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { phrSummary, listAllergies, listMedications, listRecords } from '@/lib/phr';
import { listFamily } from '@/lib/family';
import PHRDashboard from '@/components/phr/PHRDashboard';
import FamilySwitcher from '@/components/family/FamilySwitcher';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'എന്റെ ആരോഗ്യ രേഖകൾ | MalayaliDoctor' : 'My Health Records | MalayaliDoctor' };
}

export default async function HealthRecordsPage(props) {
  const { locale: raw } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/health-records`);
  const member = sp.member || '';

  const [summary, allergies, medications, records, family] = await Promise.all([
    phrSummary(uid), listAllergies(uid), listMedications(uid), listRecords(uid, undefined, member || null), listFamily(uid)
  ]);

  return (
    <div className="space-y-3">
      {family.length > 0 && (
        <div className="flex justify-end">
          <FamilySwitcher members={family} current={member} basePath={`/${locale}/patient/health-records`} locale={locale} />
        </div>
      )}
      <PHRDashboard locale={locale} summary={summary} memberId={member}
        initialAllergies={allergies} initialMeds={medications} initialRecords={records} />
    </div>
  );
}
