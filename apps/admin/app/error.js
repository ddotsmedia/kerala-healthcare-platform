'use client';

// Route error boundary with a retry button.
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => { console.error('admin route error:', error); }, [error]);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600 dark:bg-red-900/40">⚠</div>
      <div>
        <h2 className="text-lg font-bold text-ink">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-ink-soft">{error?.message || 'An unexpected error occurred while loading this page.'}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={reset} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Retry</button>
        <a href="/dashboard" className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand">Go to dashboard</a>
      </div>
    </div>
  );
}
