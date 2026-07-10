// LabReportCard.js — list item: lab, date, type, markers count, file icon.
import Link from 'next/link';

const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export default function LabReportCard({ report: r, locale = 'ml' }) {
  const ml = locale === 'ml';
  const count = r.results && typeof r.results === 'object' ? Object.keys(r.results).length : 0;
  return (
    <Link href={`/${locale}/patient/lab-reports/${r.id}`} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
        {r.file_type === 'pdf' ? '📄' : r.has_file ? '🖼️' : '🧪'}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">{r.lab_name || (ml ? 'ലാബ് റിപ്പോർട്ട്' : 'Lab report')}</h3>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
          <span>📅 {fmtDate(r.report_date)}</span>
          {r.report_type && <span className="rounded bg-gray-100 px-1.5 py-0.5">{r.report_type}</span>}
          {count > 0 && <span>🧪 {count} {ml ? 'മാർക്കറുകൾ' : 'markers'}</span>}
        </div>
      </div>
    </Link>
  );
}
