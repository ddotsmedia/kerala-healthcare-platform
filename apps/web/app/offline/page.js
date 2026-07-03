'use client';

// Offline fallback — emergency numbers work without a connection.

export default function OfflinePage() {
  const nums = [
    { n: '112', label: 'Emergency' },
    { n: '108', label: 'Ambulance' },
    { n: '104', label: 'Health Helpline' }
  ];
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-4xl">📶</div>
      <h1 className="text-xl font-bold text-gray-900">ഇന്റർനെറ്റ് കണക്ഷൻ ഇല്ല</h1>
      <p className="text-sm text-gray-600">No internet connection. Emergency contacts work offline:</p>
      <div className="w-full space-y-2">
        {nums.map((x) => (
          <a key={x.n} href={`tel:${x.n}`} aria-label={`Call ${x.n} ${x.label}`}
            className="flex items-center justify-between rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4">
            <span className="text-sm font-semibold text-gray-800">{x.label}</span>
            <span className="text-2xl font-extrabold text-red-600">{x.n}</span>
          </a>
        ))}
      </div>
      <button type="button" onClick={() => window.location.reload()}
        className="mt-2 w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
        Try again
      </button>
    </div>
  );
}
