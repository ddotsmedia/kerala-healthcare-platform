// TestRow.js — one row of a lab's tests table: name (ml+en), price, sample,
// fasting, report time. Server component.

export default function TestRow({ test, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? test.test_name_ml : test.test_name_en) || test.test_name_en;
  const alt = ml ? test.test_name_en : test.test_name_ml;
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 pr-3">
        <div className="font-medium text-gray-900">{name}</div>
        {alt && alt !== name && <div className="text-xs text-gray-400">{alt}</div>}
        <div className="mt-0.5 flex flex-wrap gap-1">
          {test.category && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{test.category}</span>}
          {test.fasting_required && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">{ml ? 'ഉപവാസം' : 'Fasting'}</span>}
          {test.home_collection_available && <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-brand">🏠</span>}
        </div>
      </td>
      <td className="py-2 pr-3 text-xs text-gray-600 whitespace-nowrap">{test.sample_type || '—'}</td>
      <td className="py-2 pr-3 text-xs text-gray-600 whitespace-nowrap">{test.report_hours ? `${test.report_hours}h` : '—'}</td>
      <td className="py-2 text-right font-semibold text-gray-900 whitespace-nowrap">{test.price_inr != null ? `₹${Number(test.price_inr).toLocaleString('en-IN')}` : '—'}</td>
    </tr>
  );
}
