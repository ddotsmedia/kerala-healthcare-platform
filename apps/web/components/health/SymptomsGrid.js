'use client';

// SymptomsGrid — search + group by body area, urgency-coloured badges.
import { useState } from 'react';
import Link from 'next/link';

const AREAS = [
  { key: 'head-neck', icon: '🧠', ml: 'തലയും കഴുത്തും', en: 'Head & Neck' },
  { key: 'chest', icon: '❤️', ml: 'നെഞ്ച്', en: 'Chest' },
  { key: 'respiratory', icon: '🫁', ml: 'ശ്വാസകോശം', en: 'Respiratory' },
  { key: 'abdomen', icon: '🫃', ml: 'വയറ്', en: 'Abdomen' },
  { key: 'musculoskeletal', icon: '🦴', ml: 'എല്ലും പേശിയും', en: 'Musculoskeletal' },
  { key: 'eyes-ears', icon: '👁️', ml: 'കണ്ണും ചെവിയും', en: 'Eyes & Ears' },
  { key: 'mental-health', icon: '🧘', ml: 'മാനസികാരോഗ്യം', en: 'Mental Health' },
  { key: 'general', icon: '🧬', ml: 'പൊതുവായത്', en: 'General' }
];
const URGENCY = {
  routine: { cls: 'bg-green-100 text-green-700', ml: 'സാധാരണം', en: 'Routine' },
  soon: { cls: 'bg-yellow-100 text-yellow-700', ml: 'ഉടൻ', en: 'Soon' },
  urgent: { cls: 'bg-orange-100 text-orange-700', ml: 'അടിയന്തരം', en: 'Urgent' },
  emergency: { cls: 'bg-red-100 text-red-700', ml: 'അത്യാഹിതം', en: 'Emergency' }
};

export default function SymptomsGrid({ symptoms = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const filtered = term
    ? symptoms.filter((s) => `${s.name_ml || ''} ${s.name_en || ''}`.toLowerCase().includes(term))
    : symptoms;

  const byArea = (key) => filtered.filter((s) => (s.body_area || 'general') === key);

  return (
    <div className="space-y-6">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder={ml ? 'ലക്ഷണം തിരയുക…' : 'Search symptoms…'}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none" />

      {AREAS.map((area) => {
        const list = byArea(area.key);
        if (list.length === 0) return null;
        return (
          <section key={area.key}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800"><span aria-hidden="true">{area.icon}</span> {ml ? area.ml : area.en}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {list.map((s) => {
                const u = URGENCY[s.urgency] || null;
                return (
                  <Link key={s.id} href={`/${locale}/symptoms/${s.slug}`}
                    className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md">
                    <span className="text-sm font-medium text-gray-900">{ml ? s.name_ml : s.name_en}</span>
                    <span className="text-xs text-gray-400">{ml ? s.name_en : s.name_ml}</span>
                    {u && <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${u.cls}`}>{ml ? u.ml : u.en}</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
