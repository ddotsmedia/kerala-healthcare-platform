'use client';

// Booking widget: 7-day strip -> live available slots -> select -> confirm.
// Slots via POST /api/appointments/slots/available; booking via /api/appointments/book.
// 401 -> redirect to login with returnUrl.
import { useEffect, useState, useCallback } from 'react';

const DAYS_ML = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MODE_LABEL = {
  in_person: { ml: 'നേരിട്ട്', en: 'In-person' },
  video: { ml: 'വീഡിയോ', en: 'Video' },
  phone: { ml: 'ഫോൺ', en: 'Phone' }
};
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function BookingWidget({ providerId, locale = 'ml', modes = [], loginPath }) {
  const ml = locale === 'ml';
  const [days, setDays] = useState([]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('');
  const [picked, setPicked] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const today = new Date();
    const arr = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i); return d;
    });
    setDays(arr);
    setDate(isoLocal(arr[0]));
  }, []);

  const loadSlots = useCallback(async (d) => {
    if (!d) return;
    setLoading(true); setPicked(null); setMsg('');
    try {
      const r = await fetch('/api/appointments/slots/available', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, date: d })
      });
      const j = await r.json();
      setSlots(Array.isArray(j.data) ? j.data : []);
    } catch { setSlots([]); } finally { setLoading(false); }
  }, [providerId]);

  useEffect(() => { if (date) loadSlots(date); }, [date, loadSlots]);

  const shown = mode ? slots.filter((s) => s.mode === mode) : slots;

  async function confirm() {
    if (!picked) return;
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/appointments/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, slotDate: date, slotStart: picked.start, mode: picked.mode })
      });
      if (r.status === 401) {
        const ret = encodeURIComponent(window.location.pathname);
        window.location.href = `${loginPath}?returnUrl=${ret}`;
        return;
      }
      const j = await r.json();
      if (r.status === 201) {
        setMsg((ml ? 'ബുക്ക് ചെയ്തു! റഫറൻസ്: ' : 'Booked! Ref: ') + (j.data?.booking_ref || ''));
        setPicked(null); loadSlots(date);
      } else if (r.status === 409) {
        setMsg(ml ? 'ഈ സ്ലോട്ട് എടുത്തുകഴിഞ്ഞു. മറ്റൊന്ന് തിരഞ്ഞെടുക്കൂ.' : 'Slot just taken. Pick another.');
        loadSlots(date);
      } else {
        setMsg(ml ? 'ബുക്കിംഗ് പരാജയപ്പെട്ടു' : 'Booking failed');
      }
    } catch {
      setMsg(ml ? 'ഒരു പിശക് സംഭവിച്ചു' : 'Something went wrong');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      {/* 7-day strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => {
          const iso = isoLocal(d);
          const on = iso === date;
          return (
            <button key={iso} type="button" onClick={() => setDate(iso)}
              className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center ${on ? 'border-brand bg-brand text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-brand'}`}>
              <span className="text-xs">{(ml ? DAYS_ML : DAYS_EN)[d.getDay()]}</span>
              <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* mode filter (multi-mode only) */}
      {modes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMode('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${mode === '' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
            {ml ? 'എല്ലാം' : 'All'}
          </button>
          {modes.map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${mode === m ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
              {(MODE_LABEL[m] || {})[locale] || m}
            </button>
          ))}
        </div>
      )}

      {/* slots */}
      {loading ? (
        <p className="text-sm text-gray-500">{ml ? 'സ്ലോട്ടുകൾ ലോഡ് ചെയ്യുന്നു…' : 'Loading slots…'}</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-gray-500">{ml ? 'ഈ ദിവസം സ്ലോട്ടുകൾ ലഭ്യമല്ല' : 'No slots available this day'}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {shown.map((s, i) => {
            const on = picked && picked.start === s.start && picked.mode === s.mode;
            return (
              <button key={i} type="button" onClick={() => setPicked(s)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${on ? 'border-brand bg-brand text-white' : 'border-teal-200 bg-teal-50 text-brand hover:border-brand'}`}>
                {s.start}
              </button>
            );
          })}
        </div>
      )}

      {picked && (
        <button type="button" onClick={confirm} disabled={busy}
          className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto">
          {busy ? (ml ? 'ബുക്ക് ചെയ്യുന്നു…' : 'Booking…') : (ml ? `${picked.start} സ്ഥിരീകരിക്കുക` : `Confirm ${picked.start}`)}
        </button>
      )}
      {msg && <p className="text-sm font-medium text-gray-700">{msg}</p>}
    </div>
  );
}
