// Prescriptions — list sorted by date, search, upload. Patient-owned.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listPrescriptions } from '@/lib/prescriptions';
import { EmptyState } from '@khp/ui';
import PrescriptionCard from '@/components/prescriptions/PrescriptionCard';
import UploadPrescription from '@/components/prescriptions/UploadPrescription';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'പ്രിസ്ക്രിപ്ഷനുകൾ | MalayaliDoctor' : 'Prescriptions | MalayaliDoctor' };
}

export default async function PrescriptionsPage(props) {
  const { locale: raw } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/prescriptions`);

  const q = sp.q || '';
  const list = await listPrescriptions(uid, q);
  const basePath = `/${locale}/patient/prescriptions`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">💊 {ml ? 'പ്രിസ്ക്രിപ്ഷനുകൾ' : 'Prescriptions'}</h1>
        <UploadPrescription locale={locale} />
      </div>

      <form action={basePath} method="get">
        <input type="search" name="q" defaultValue={q} placeholder={ml ? 'ഡോക്ടർ അല്ലെങ്കിൽ മരുന്ന് തിരയുക…' : 'Search by doctor or medication…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none" />
      </form>

      {list.length === 0 ? <EmptyState message={ml ? 'പ്രിസ്ക്രിപ്ഷനുകളൊന്നുമില്ല' : 'No prescriptions yet'} /> : (
        <div className="grid gap-3">{list.map((p) => <PrescriptionCard key={p.id} prescription={p} locale={locale} />)}</div>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'നിങ്ങളുടെ പ്രിസ്ക്രിപ്ഷനുകൾ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു. ഡോക്ടറുടെ നിർദേശപ്രകാരം മാത്രം മരുന്നുകൾ കഴിക്കുക — സ്വയം മരുന്ന് കഴിക്കരുത്.' : 'Your prescriptions are stored privately. Take medicines only as directed by your doctor — do not self-medicate.'}
      </div>
    </main>
  );
}
