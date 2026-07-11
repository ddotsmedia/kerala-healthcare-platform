'use client';

// VideoCall.js — embeds a Jitsi Meet call via external_api.js (loaded from the
// Jitsi host at runtime — no npm package). Falls back to opening in a new tab if
// the embed is blocked (CSP). Start/end update the appointment.
import { useEffect, useRef, useState } from 'react';

export default function VideoCall({ appointmentId, roomName, displayName, jitsiUrl, role, providerSlug, locale = 'ml' }) {
  const ml = locale === 'ml';
  const host = (() => { try { return new URL(jitsiUrl).host; } catch { return 'meet.jit.si'; } })();
  const boxRef = useRef(null);
  const apiRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);

  function post(action) {
    fetch('/api/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId, action }) }).catch(() => {});
  }

  async function join() {
    setJoined(true);
    post('start');
    try {
      if (!window.JitsiMeetExternalAPI) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = `https://${host}/external_api.js`; s.async = true;
          s.onload = resolve; s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      apiRef.current = new window.JitsiMeetExternalAPI(host, {
        roomName, parentNode: boxRef.current,
        width: '100%', height: 480,
        userInfo: { displayName },
        configOverwrite: { prejoinPageEnabled: false }
      });
      apiRef.current.addEventListener('readyToClose', () => end());
    } catch { setFailed(true); }
  }

  function end() {
    try { apiRef.current?.dispose(); } catch { /* noop */ }
    apiRef.current = null;
    post('end');
    setEnded(true);
  }

  useEffect(() => () => { try { apiRef.current?.dispose(); } catch { /* noop */ } }, []);

  if (ended) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <div className="text-3xl">✅</div>
        <p className="mt-2 font-semibold text-gray-900">{ml ? 'കൺസൾട്ടേഷൻ അവസാനിച്ചു' : 'Consultation ended'}</p>
        {role === 'patient' && providerSlug && (
          <a href={`/${locale}/doctors/${providerSlug}#reviews`} className="mt-3 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
            ⭐ {ml ? 'ഒരു റിവ്യൂ എഴുതുക' : 'Leave a review'}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!joined ? (
        <button onClick={join} className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
          🎥 {ml ? 'വീഡിയോ കോളിൽ ചേരുക' : 'Join Video Call'}
        </button>
      ) : (
        <>
          <div ref={boxRef} className="min-h-[480px] w-full overflow-hidden rounded-xl bg-black" />
          {failed && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {ml ? 'എംബെഡ് ലോഡ് ചെയ്യാനായില്ല. ' : 'Could not embed the call. '}
              <a href={jitsiUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">{ml ? 'പുതിയ ടാബിൽ തുറക്കുക' : 'Open in a new tab'}</a>
            </p>
          )}
          <div className="flex gap-2">
            <a href={jitsiUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">{ml ? 'പുതിയ ടാബിൽ' : 'Open in tab'}</a>
            <button onClick={end} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">📞 {ml ? 'കോൾ അവസാനിപ്പിക്കുക' : 'End Call'}</button>
          </div>
        </>
      )}
    </div>
  );
}
