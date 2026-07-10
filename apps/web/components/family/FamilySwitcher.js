'use client';

// FamilySwitcher.js — "Viewing: [Self ▼]" selector for PHR pages. Navigates to
// the same page with ?member=<id> (empty = self).
import { useRouter } from 'next/navigation';

export default function FamilySwitcher({ members = [], current = '', basePath, locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  function onChange(e) {
    const v = e.target.value;
    router.push(v ? `${basePath}?member=${v}` : basePath);
  }
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">{ml ? 'കാണുന്നത്:' : 'Viewing:'}</span>
      <select value={current} onChange={onChange} className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
        <option value="">{ml ? 'ഞാൻ' : 'Self'}</option>
        {members.map((m) => <option key={m.id} value={m.id}>{ml ? (m.name_ml || m.name_en) : m.name_en}</option>)}
      </select>
    </label>
  );
}
