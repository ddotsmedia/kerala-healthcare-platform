'use client';

// Dismissable full-width emergency banner. Stays above the navbar.
import { useState } from 'react';

const TEXT = {
  ml: 'അടിയന്തരം? ഇപ്പോൾ വിളിക്കൂ:',
  en: 'Emergency? Call now:'
};

export default function EmergencyBanner({ locale = 'ml' }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="w-full bg-red-600 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-sm font-bold">
        <span aria-hidden="true">🚨</span>
        <span>
          {TEXT[locale] || TEXT.en}{' '}
          <a href="tel:112" className="underline underline-offset-2">112</a>{' '}
          (Emergency) ·{' '}
          <a href="tel:108" className="underline underline-offset-2">108</a>{' '}
          (Ambulance)
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={locale === 'ml' ? 'അടയ്ക്കുക' : 'Dismiss'}
          className="absolute right-4 hidden text-white/80 hover:text-white sm:block"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
