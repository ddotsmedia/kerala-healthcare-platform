'use client';

// Copy-link + WhatsApp share for the referral link. wa.me deep link (no API).
import { useState } from 'react';

const COPIED_MS = 2000;

export default function ReferralShare({ link, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setCopied(false);
    }
  }

  const message = ml
    ? `കേരളത്തിലെ ഡോക്ടർമാരെയും ആശുപത്രികളെയും കണ്ടെത്തി അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ MalayaliDoctor ഉപയോഗിക്കൂ: ${link}`
    : `Find doctors and hospitals across Kerala and book appointments on MalayaliDoctor: ${link}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="space-y-3">
      <label htmlFor="referral-link" className="block text-sm font-medium text-gray-700">
        {ml ? 'നിങ്ങളുടെ റഫറൽ ലിങ്ക്' : 'Your referral link'}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="referral-link" type="text" readOnly value={link}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-brand focus:outline-none"
        />
        <button
          type="button" onClick={copy}
          aria-live="polite"
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {copied ? (ml ? '✓ പകർത്തി' : '✓ Copied') : (ml ? '📋 പകർത്തുക' : '📋 Copy')}
        </button>
      </div>
      <a
        href={wa} target="_blank" rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
      >
        💬 {ml ? 'WhatsApp-ൽ പങ്കിടുക' : 'Share on WhatsApp'}
      </a>
    </div>
  );
}
