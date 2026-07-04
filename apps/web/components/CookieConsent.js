'use client';

// Cookie consent (DPDP). Stores preference in localStorage; hides once decided.
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'khp-cookie-consent';

export default function CookieConsent({ locale = 'ml' }) {
  const ml = locale === 'ml';
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch { /* noop */ }
  }, []);

  function decide(v) {
    try { localStorage.setItem(KEY, v); } catch { /* noop */ }
    setShow(false);
  }
  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-gray-600">
          {ml
            ? 'നിങ്ങളുടെ അനുഭവം മെച്ചപ്പെടുത്താൻ ഞങ്ങൾ കുക്കികൾ ഉപയോഗിക്കുന്നു. '
            : 'We use cookies to improve your experience. '}
          <Link href={`/${locale}/privacy`} className="font-medium text-brand hover:underline">
            {ml ? 'സ്വകാര്യതാ നയം' : 'Privacy Policy'}
          </Link>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => decide('declined')} className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700">
            {ml ? 'നിരസിക്കുക' : 'Decline'}
          </button>
          <button type="button" onClick={() => decide('accepted')} className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white">
            {ml ? 'സ്വീകരിക്കുക' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
