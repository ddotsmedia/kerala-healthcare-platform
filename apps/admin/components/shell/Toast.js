'use client';

// Toast system — CSS-only animation, no package. useToast() from anywhere under
// <ToastProvider>. Types: success | error | warning | info.

import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

const TONE = {
  success: { icon: '✓', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700' },
  error: { icon: '✕', cls: 'border-red-300 bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700' },
  warning: { icon: '!', cls: 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700' },
  info: { icon: 'i', cls: 'border-teal-300 bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-700' }
};

let seq = 0;

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const toast = useCallback((message, type = 'info', ms = 3500) => {
    const id = ++seq;
    setItems((xs) => [...xs, { id, message, type }]);
    if (ms) setTimeout(() => remove(id), ms);
    return id;
  }, [remove]);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((t) => {
          const tone = TONE[t.type] || TONE.info;
          return (
            <div key={t.id} role="status"
              className={`toast-enter pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-lg ${tone.cls}`}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/60 text-xs font-bold dark:bg-black/20">{tone.icon}</span>
              <span className="flex-1">{t.message}</span>
              <button onClick={() => remove(t.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">✕</button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
