'use client';

// Searchable tests table for a lab profile. Client-side filter by name/category.
import { useMemo, useState } from 'react';
import { TestRow } from '@khp/ui';

export default function TestsTable({ tests = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tests;
    return tests.filter((t) =>
      `${t.test_name_en || ''} ${t.test_name_ml || ''} ${t.category || ''} ${t.test_code || ''}`.toLowerCase().includes(s));
  }, [q, tests]);

  if (!tests.length) return <p className="text-sm text-gray-500">{ml ? 'ടെസ്റ്റുകൾ ലിസ്റ്റ് ചെയ്തിട്ടില്ല.' : 'No tests listed.'}</p>;

  return (
    <div>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder={ml ? 'ടെസ്റ്റ് തിരയുക…' : 'Search tests…'}
        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-400">
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-3 font-medium">{ml ? 'ടെസ്റ്റ്' : 'Test'}</th>
              <th className="py-2 pr-3 font-medium">{ml ? 'സാമ്പിൾ' : 'Sample'}</th>
              <th className="py-2 pr-3 font-medium">{ml ? 'റിപ്പോർട്ട്' : 'Report'}</th>
              <th className="py-2 text-right font-medium">{ml ? 'വില' : 'Price'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => <TestRow key={t.id} test={t} locale={locale} />)}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="mt-3 text-sm text-gray-500">{ml ? 'പൊരുത്തമില്ല.' : 'No matching tests.'}</p>}
    </div>
  );
}
