'use client';

// Sleep calculator — bedtimes from wake-up time (90-min cycles + 15 min to fall asleep).
import { useState, use } from 'react';
import { resolveLocale } from '@/lib/i18n';

function fmt(mins) {
  let m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}

export default function Sleep(props) {
  const params = use(props.params);
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const [wake, setWake] = useState('06:30');
  const [times, setTimes] = useState(null);

  function calc(e) {
    e.preventDefault();
    const [h, m] = wake.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) { setTimes(null); return; }
    const wakeMin = h * 60 + m;
    // 6,5,4 cycles (90 min each) + 15 min to fall asleep.
    setTimes([6, 5, 4].map((c) => ({ cycles: c, hours: (c * 90) / 60, at: fmt(wakeMin - c * 90 - 15) })));
  }
  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-4">
      <h1 className="text-xl font-bold">{ml ? 'സ്ലീപ്പ് കാൽക്കുലേറ്റർ' : 'Sleep Calculator'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'എഴുന്നേൽക്കേണ്ട സമയം നൽകുക — ഉറങ്ങേണ്ട സമയങ്ങൾ കാണിക്കും.' : 'Enter your wake-up time — we suggest bedtimes.'}</p>
      <form onSubmit={calc} className="space-y-3">
        <label className="block text-sm">{ml ? 'എഴുന്നേൽക്കുന്ന സമയം' : 'Wake-up time'}
          <input type="time" className={inp} value={wake} onChange={(e) => setWake(e.target.value)} required /></label>
        <button className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white">{ml ? 'കണക്കാക്കുക' : 'Calculate'}</button>
      </form>
      {times && (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-center text-xs text-gray-500">{ml ? 'ഈ സമയങ്ങളിൽ ഒന്നിൽ ഉറങ്ങുക' : 'Go to bed at one of these times'}</p>
          {times.map((x) => (
            <div key={x.cycles} className="flex items-center justify-between text-sm">
              <span className="text-2xl font-bold text-brand">{x.at}</span>
              <span className="text-gray-600">{x.hours}h · {x.cycles} {ml ? 'സൈക്കിളുകൾ' : 'cycles'}</span>
            </div>
          ))}
        </div>
      )}
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{ml ? 'ഇത് പൊതു മാർഗനിർദേശം മാത്രം.' : 'General guidance only.'}</p>
    </div>
  );
}
