'use client';

// RefillForm.js — pick a past prescription, choose medications + doctor, submit.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefillForm({ prescriptions = [], doctors = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [rxId, setRxId] = useState('');
  const [picked, setPicked] = useState({}); // index -> bool
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('routine');
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');

  const rx = useMemo(() => prescriptions.find((p) => p.id === rxId) || null, [rxId, prescriptions]);
  const meds = rx && Array.isArray(rx.medications) ? rx.medications : [];

  function onPickRx(id) {
    setRxId(id);
    const p = prescriptions.find((x) => x.id === id);
    const all = {}; (p?.medications || []).forEach((_, i) => { all[i] = true; });
    setPicked(all);
    if (p?.doctor_id) setDoctorId(p.doctor_id);
  }

  async function submit(e) {
    e.preventDefault();
    const chosen = meds.filter((_, i) => picked[i]);
    if (!doctorId) { setMsg(ml ? 'ഡോക്ടറെ തിരഞ്ഞെടുക്കുക' : 'Select a doctor'); return; }
    if (!chosen.length) { setMsg(ml ? 'കുറഞ്ഞത് ഒരു മരുന്ന് തിരഞ്ഞെടുക്കുക' : 'Pick at least one medication'); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/patient/refill-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId, original_prescription_id: rxId || null, medications_requested: chosen, reason, urgency })
      });
      if (r.status === 401) { window.location.href = `/${locale}/login`; return; }
      if (r.ok) { setState('done'); router.refresh(); }
      else { setState('error'); setMsg(ml ? 'സമർപ്പിക്കാനായില്ല' : 'Could not submit'); }
    } catch { setState('error'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  const URG = [['routine', ml ? 'സാധാരണം' : 'Routine'], ['soon', ml ? 'ഉടൻ' : 'Soon'], ['urgent', ml ? 'അടിയന്തരം' : 'Urgent']];

  if (state === 'done') {
    return <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center text-sm font-medium text-green-800">
      {ml ? '✅ റീഫിൽ അഭ്യർത്ഥന അയച്ചു. ഡോക്ടർ അവലോകനം ചെയ്യും.' : '✅ Refill request sent. Your doctor will review it.'}</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{ml ? 'റീഫിൽ അഭ്യർത്ഥിക്കുക' : 'Request a refill'}</h2>

      <label className="block text-sm"><span className="text-gray-700">{ml ? 'മുൻ പ്രിസ്ക്രിപ്ഷൻ' : 'Previous prescription'}</span>
        <select value={rxId} onChange={(e) => onPickRx(e.target.value)} className={`mt-1 ${inp}`}>
          <option value="">{ml ? 'തിരഞ്ഞെടുക്കുക…' : 'Select…'}</option>
          {prescriptions.map((p) => <option key={p.id} value={p.id}>{p.doctor_name || 'Rx'} · {String(p.prescribed_date || p.created_at).slice(0, 10)}</option>)}
        </select>
      </label>

      {meds.length > 0 && (
        <div className="text-sm">
          <span className="text-gray-700">{ml ? 'റീഫിൽ ചെയ്യേണ്ട മരുന്നുകൾ' : 'Medications to refill'}</span>
          <div className="mt-1 space-y-1 rounded-lg border border-gray-200 p-2">
            {meds.map((m, i) => (
              <label key={i} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!picked[i]} onChange={() => setPicked((p) => ({ ...p, [i]: !p[i] }))} /> <b>{m.name}</b> {[m.dosage, m.frequency].filter(Boolean).join(' · ')}</label>
            ))}
          </div>
        </div>
      )}

      <label className="block text-sm"><span className="text-gray-700">{ml ? 'ഡോക്ടർ' : 'Doctor'}</span>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={`mt-1 ${inp}`}>
          <option value="">{ml ? 'തിരഞ്ഞെടുക്കുക…' : 'Select…'}</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.display_name}</option>)}
        </select>
      </label>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="text-gray-700">{ml ? 'അടിയന്തരത:' : 'Urgency:'}</span>
        {URG.map(([v, l]) => <label key={v} className="flex items-center gap-1"><input type="radio" checked={urgency === v} onChange={() => setUrgency(v)} /> {l}</label>)}
      </div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder={ml ? 'കുറിപ്പ് (ഓപ്ഷണൽ)' : 'Reason / notes (optional)'} className={inp} />

      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === 'busy'} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : (ml ? 'അഭ്യർത്ഥന അയക്കുക' : 'Send request')}
      </button>
    </form>
  );
}
