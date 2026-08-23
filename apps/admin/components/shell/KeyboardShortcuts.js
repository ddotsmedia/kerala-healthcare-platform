'use client';

// Global keyboard shortcuts: ? = help, g then d/r/p/a = go to page, Esc = close.

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const GOTO = { d: '/dashboard', r: '/reviews', p: '/verification', a: '/analytics', q: '/qa' };
const LIST = [
  ['?', 'Show this help'],
  ['g then d', 'Go to Dashboard'],
  ['g then r', 'Go to Reviews'],
  ['g then p', 'Go to Providers'],
  ['g then a', 'Go to Analytics'],
  ['g then q', 'Go to Q&A'],
  ['Esc', 'Close modal / drawer']
];

export default function KeyboardShortcuts() {
  const [help, setHelp] = useState(false);
  const router = useRouter();
  const leader = useRef(0);

  useEffect(() => {
    const typing = (el) => el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
    const onKey = (e) => {
      if (typing(e.target)) return;
      if (e.key === 'Escape') { setHelp(false); window.dispatchEvent(new CustomEvent('admin:escape')); return; }
      if (e.key === '?') { e.preventDefault(); setHelp((h) => !h); return; }
      const now = Date.now();
      if (e.key === 'g') { leader.current = now; return; }
      if (now - leader.current < 1200 && GOTO[e.key]) { leader.current = 0; router.push(GOTO[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  if (!help) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={() => setHelp(false)}>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Keyboard shortcuts</h2>
          <button onClick={() => setHelp(false)} aria-label="Close" className="text-ink-soft hover:text-ink">✕</button>
        </div>
        <ul className="space-y-2">
          {LIST.map(([k, d]) => (
            <li key={k} className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">{d}</span>
              <kbd className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink">{k}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
