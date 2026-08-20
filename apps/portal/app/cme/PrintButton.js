'use client';

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand hover:bg-teal-50">
      🖨 Print summary
    </button>
  );
}
