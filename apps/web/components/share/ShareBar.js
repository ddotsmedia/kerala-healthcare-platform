'use client';

// ShareBar — WhatsApp / Copy link / Facebook / Twitter(X), plus optional Print.
// No packages: wa.me + sharer window.open + navigator.clipboard + window.print.
// `message` is the pre-written share text; the current page URL is appended.

import { useState } from 'react';
import { trackEvent } from '@/components/analytics/PageViewTracker';

const btn = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition';

function pop(url) {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520');
}

export default function ShareBar({ message = '', locale = 'ml', showPrint = false, contentId = null }) {
  const ml = locale === 'ml';
  const [copied, setCopied] = useState(false);

  const here = () => (typeof window !== 'undefined' ? window.location.href : '');
  const share = (channel) => { if (contentId) trackEvent('article_share', { entityType: 'article', contentId, metadata: { channel } }); };

  function whatsapp() {
    share('whatsapp');
    pop(`https://wa.me/?text=${encodeURIComponent(`${message} ${here()}`.trim())}`);
  }
  function facebook() {
    share('facebook');
    pop(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(here())}`);
  }
  function twitter() {
    share('twitter');
    pop(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(here())}`);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(here());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* blocked — no-op */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ml ? 'പങ്കിടുക' : 'Share'}>
      <span className="text-xs font-medium text-gray-500">{ml ? 'പങ്കിടുക:' : 'Share:'}</span>
      <button type="button" onClick={whatsapp} className={`${btn} bg-[#25D366] text-white hover:opacity-90`} aria-label="WhatsApp">
        <span aria-hidden="true">💬</span> WhatsApp
      </button>
      <button type="button" onClick={facebook} className={`${btn} bg-[#1877F2] text-white hover:opacity-90`} aria-label="Facebook">
        <span aria-hidden="true">f</span> Facebook
      </button>
      <button type="button" onClick={twitter} className={`${btn} bg-black text-white hover:opacity-90`} aria-label="X (Twitter)">
        <span aria-hidden="true">𝕏</span> Post
      </button>
      <button type="button" onClick={copy} className={`${btn} border border-gray-300 text-gray-700 hover:border-brand hover:text-brand`} aria-label={ml ? 'ലിങ്ക് പകർത്തുക' : 'Copy link'}>
        <span aria-hidden="true">🔗</span> {copied ? (ml ? 'പകർത്തി!' : 'Copied!') : (ml ? 'ലിങ്ക്' : 'Copy')}
      </button>
      {showPrint && (
        <button type="button" onClick={() => window.print()} className={`${btn} border border-gray-300 text-gray-700 hover:border-brand hover:text-brand`} aria-label={ml ? 'പ്രിന്റ്' : 'Print'}>
          <span aria-hidden="true">🖨️</span> {ml ? 'പ്രിന്റ്' : 'Print'}
        </button>
      )}
    </div>
  );
}
