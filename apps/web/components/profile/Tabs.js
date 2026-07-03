'use client';

// Generic tabbed panels. Panels are pre-rendered (server) nodes passed as props.
import { useState } from 'react';

export default function Tabs({ tabs = [] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 pb-1.5">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setActive(tb.key)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              active === tb.key ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs.map((tb) => (
          <div key={tb.key} className={active === tb.key ? 'block' : 'hidden'}>{tb.content}</div>
        ))}
      </div>
    </div>
  );
}
