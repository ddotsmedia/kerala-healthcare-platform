'use client';

// VoiceSearch — Malayalam-first voice search using the native Web Speech API.
// No packages. Renders a mic button that fills the enclosing form's search
// input with the transcript and auto-submits. Hidden entirely on browsers
// without SpeechRecognition (Firefox, older browsers) — graceful degradation.

import { useState, useRef, useEffect } from 'react';

export default function VoiceSearch({ locale = 'ml', targetName = 'q', onResult = null }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const btnRef = useRef(null);
  const recRef = useRef(null);
  const ml = locale === 'ml';

  useEffect(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!SR);
    return () => { try { recRef.current && recRef.current.stop(); } catch { /* noop */ } };
  }, []);

  if (!supported) return null;

  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = ml ? 'ml-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;
    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = ((e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript) || '').trim();
      setListening(false);
      if (!transcript) return;
      // Controlled-input mode: hand the transcript back to the parent.
      if (typeof onResult === 'function') { onResult(transcript); return; }
      // Form mode: fill the enclosing form's search input and auto-submit.
      const form = btnRef.current && btnRef.current.closest('form');
      const input = form && form.querySelector(`input[name="${targetName}"]`);
      if (input) {
        input.value = transcript;
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.submit();
      }
    };
    try { rec.start(); } catch { setListening(false); }
  }

  function stop() {
    try { recRef.current && recRef.current.stop(); } catch { /* noop */ }
    setListening(false);
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={listening ? stop : start}
      aria-label={ml ? 'ശബ്ദം ഉപയോഗിച്ച് തിരയുക' : 'Search by voice'}
      title={ml ? 'ശബ്ദ തിരയൽ' : 'Voice search'}
      className={`flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-lg transition ${
        listening
          ? 'animate-pulse border-red-300 bg-red-50 text-red-600'
          : 'border-gray-300 text-gray-500 hover:border-brand hover:text-brand'
      }`}
    >
      <span aria-hidden="true">{listening ? '🔴' : '🎤'}</span>
    </button>
  );
}
