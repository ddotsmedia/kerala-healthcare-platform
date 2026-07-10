// Lab report detail — results table (out-of-range highlighted), file view, edit.
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { getLabReport } from '@/lib/labReports';
import { markerByKey, bandFor, isOutOfRange } from '@/lib/labMarkers';
import EditLabReport from '@/components/labreports/EditLabReport';

export const dynamic = 'force-dynamic';
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ലാബ് റിപ്പോർട്ട് | MalayaliDoctor' : 'Lab Report | MalayaliDoctor' };
}

export default async function LabReportDetail(props) {
  const { locale: raw, id } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login`);
  const r = await getLabReport(uid, id);
  if (!r) notFound();

  const results = r.results && typeof r.results === 'object' ? r.results : {};
  const keys = Object.keys(results);
  const fileUrl = r.has_file ? `/api/patient/lab-reports/${r.id}/file` : null;
  const isImage = r.file_type === 'jpg' || r.file_type === 'png';

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/patient/lab-reports`} className="hover:text-brand">{ml ? 'ലാബ് റിപ്പോർട്ടുകൾ' : 'Lab Reports'}</Link> › <span className="text-gray-700">{r.lab_name || fmtDate(r.report_date)}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">{r.lab_name || (ml ? 'ലാബ് റിപ്പോർട്ട്' : 'Lab report')}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>📅 {fmtDate(r.report_date)}</span>
          {r.report_type && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{r.report_type}</span>}
          {r.ordered_by_doctor && <span>{ml ? 'നിർദേശിച്ചത്' : 'Ordered by'}: {r.ordered_by_doctor}</span>}
        </div>
      </header>

      {/* Results table */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഫലങ്ങൾ' : 'Results'}</h2>
        {keys.length === 0 ? <p className="text-sm text-gray-500">{ml ? 'ഫലങ്ങൾ രേഖപ്പെടുത്തിയിട്ടില്ല' : 'No results recorded'}</p> : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400"><tr className="border-b border-gray-200">
              <th className="py-2">{ml ? 'മാർക്കർ' : 'Marker'}</th><th className="py-2 text-right">{ml ? 'മൂല്യം' : 'Value'}</th><th className="py-2 text-right">{ml ? 'സാധാരണം' : 'Normal'}</th>
            </tr></thead>
            <tbody>
              {keys.map((k) => {
                const res = results[k]; const m = markerByKey(k); const band = bandFor(k, res);
                const bad = isOutOfRange(k, Number(res.value), res) === true;
                return (
                  <tr key={k} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-800">{m ? (ml ? m.ml : m.en) : k}</td>
                    <td className={`py-2 text-right font-semibold ${bad ? 'text-red-600' : 'text-gray-900'}`}>{res.value} {res.unit || m?.unit}{bad && <span className="ml-1 text-xs">⚠️</span>}</td>
                    <td className="py-2 text-right text-xs text-gray-400">{band.min ?? '–'}–{band.max ?? '∞'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {fileUrl && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഫയൽ' : 'Report file'}</h2>
          {isImage ? <img src={fileUrl} alt="lab report" className="max-h-[70vh] w-full rounded-lg object-contain" />
            : <iframe src={fileUrl} title="lab report" className="h-[70vh] w-full rounded-lg border border-gray-200" />}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-brand">{ml ? 'പുതിയ ടാബിൽ തുറക്കുക →' : 'Open in new tab →'}</a>
        </section>
      )}

      {r.notes && <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'കുറിപ്പുകൾ' : 'Notes'}</h2><p className="text-sm text-gray-700 whitespace-pre-line">{r.notes}</p></section>}

      <EditLabReport report={r} locale={locale} />

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ശരിയായ വ്യാഖ്യാനത്തിനായി ഈ ഫലങ്ങൾ നിങ്ങളുടെ ഡോക്ടറുമായി പങ്കിടുക. സ്വയം രോഗനിർണയം നടത്തരുത്.' : 'Share these results with your doctor for proper interpretation. Do not self-diagnose.'}
      </div>
    </main>
  );
}
