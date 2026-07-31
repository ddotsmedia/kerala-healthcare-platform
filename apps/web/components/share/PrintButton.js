'use client';

// PrintButton — triggers the browser print dialog. For prescriptions / lab reports.
export default function PrintButton({ locale = 'ml' }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand print:hidden"
    >
      <span aria-hidden="true">🖨️</span> {locale === 'ml' ? 'പ്രിന്റ്' : 'Print'}
    </button>
  );
}
