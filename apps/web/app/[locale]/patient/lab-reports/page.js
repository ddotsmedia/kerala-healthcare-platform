// Lab reports — list by date, parameter trends, upload. Patient-owned.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { listLabReports } from '@/lib/labReports';
import { EmptyState } from '@khp/ui';
import LabReportCard from '@/components/labreports/LabReportCard';
import LabTrendChart from '@/components/labreports/LabTrendChart';
import UploadLabReport from '@/components/labreports/UploadLabReport';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ലാബ് റിപ്പോർട്ടുകൾ | MalayaliDoctor' : 'Lab Reports | MalayaliDoctor' };
}

export default async function LabReportsPage(props) {
  const { locale: raw } = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login?returnUrl=/${locale}/patient/lab-reports`);

  const q = sp.q || '';
  const list = await listLabReports(uid, q);
  const basePath = `/${locale}/patient/lab-reports`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">🧪 {ml ? 'ലാബ് റിപ്പോർട്ടുകൾ' : 'Lab Reports'}</h1>
        <UploadLabReport locale={locale} />
      </div>

      <LabTrendChart locale={locale} />

      <form action={basePath} method="get">
        <input type="search" name="q" defaultValue={q} placeholder={ml ? 'ലാബ് / തരം / ഡോക്ടർ തിരയുക…' : 'Search lab / type / doctor…'}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none" />
      </form>

      {list.length === 0 ? <EmptyState message={ml ? 'റിപ്പോർട്ടുകളൊന്നുമില്ല' : 'No lab reports yet'} /> : (
        <div className="grid gap-3">{list.map((r) => <LabReportCard key={r.id} report={r} locale={locale} />)}</div>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ശരിയായ വ്യാഖ്യാനത്തിനായി ഈ ട്രെൻഡുകൾ നിങ്ങളുടെ ഡോക്ടറുമായി പങ്കിടുക. സ്വയം രോഗനിർണയം നടത്തരുത്.' : 'Share these trends with your doctor for proper interpretation. Do not self-diagnose.'}
      </div>
    </main>
  );
}
