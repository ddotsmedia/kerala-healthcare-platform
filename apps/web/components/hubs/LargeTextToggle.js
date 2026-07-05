'use client';

// A+ font-size toggle (persisted). Adds .senior-large to <html>.
import { useEffect, useState } from 'react';

const KEY = 'khp-large-text';

export default function LargeTextToggle({ locale = 'ml' }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const v = (() => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } })();
    setOn(v); document.documentElement.classList.toggle('senior-large', v);
  }, []);
  function toggle() {
    const v = !on; setOn(v);
    document.documentElement.classList.toggle('senior-large', v);
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* noop */ }
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={on} aria-label={locale === 'ml' ? 'വലിയ അക്ഷരം' : 'Larger text'}
      className={`rounded-lg border px-4 py-2 text-sm font-bold ${on ? 'border-brand bg-brand text-white' : 'border-gray-300 text-gray-700'}`}>
      A+ {locale === 'ml' ? 'വലിയ അക്ഷരം' : 'Larger text'}
    </button>
  );
}
