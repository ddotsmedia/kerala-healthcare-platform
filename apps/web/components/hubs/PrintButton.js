'use client';

export default function PrintButton({ label = 'Print' }) {
  return (
    <button type="button" onClick={() => window.print()}
      className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50 print:hidden">
      🖨️ {label}
    </button>
  );
}
