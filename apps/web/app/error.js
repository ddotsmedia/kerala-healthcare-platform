'use client';

// Global error boundary (500).
import Link from 'next/link';

export default function Error({ reset }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="text-5xl" aria-hidden="true">⚠️</div>
      <h1 className="text-xl font-bold text-gray-900">എന്തോ കുഴപ്പം സംഭവിച്ചു</h1>
      <p className="text-sm text-gray-600">Something went wrong. Please try again.</p>
      <button type="button" onClick={() => reset()} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
        വീണ്ടും ശ്രമിക്കുക
      </button>
      <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
        🚨 അടിയന്തരം: <a href="tel:112" className="underline">112</a> · <a href="tel:108" className="underline">108</a>
      </div>
      <Link href="/ml/contact" className="text-sm font-semibold text-brand hover:underline">പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക →</Link>
    </div>
  );
}
