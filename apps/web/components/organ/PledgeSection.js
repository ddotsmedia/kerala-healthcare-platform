'use client';

// PledgeSection — live counter + pledge form sharing state, so the counter
// increments the moment a pledge is recorded.
import { useState } from 'react';
import PledgeForm from './PledgeForm';

export default function PledgeSection({ locale = 'ml', districts = [], initialCount = 0, knosUrl }) {
  const ml = locale === 'ml';
  const [count, setCount] = useState(initialCount);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] p-5 text-center text-white">
        <div className="text-4xl font-extrabold tabular-nums">{count.toLocaleString('en-IN')}</div>
        <p className="mt-1 text-sm text-white/90">
          {ml ? 'MalayaliDoctor-ൽ എടുത്ത പ്രതിജ്ഞകൾ' : 'pledges made on MalayaliDoctor'}
        </p>
      </div>
      <PledgeForm locale={locale} districts={districts} knosUrl={knosUrl}
        onPledged={(n) => setCount(n)} />
    </div>
  );
}
