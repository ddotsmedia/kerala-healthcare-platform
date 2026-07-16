'use client';

// RequestForm.js — request blood; on success alerts matching donors server-side.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BLOOD_GROUPS, URGENCY } from '@/lib/bloodConstants';

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default function RequestForm({ districts = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [form, setForm] = useState({ blood_group: '', district_id: '', hospital_name: '', contact_phone: '', units_needed: 1, urgency: 'urgent' });
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.blood_group || !form.district_id || !form.contact_phone) { setMsg(ml ? 'രക്തഗ്രൂപ്പ്, ജില്ല, ഫോൺ ആവശ്യമാണ്' : 'Blood group, district and phone are required'); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/blood-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (r.status === 401) { window.location.href = `/${locale}/login?returnUrl=/${locale}/donate-blood`; return; }
      if (r.ok) { const { data } = await r.json(); setState('done'); setMsg(String(data?.alerted || 0)); router.refresh(); }
      else { setState('idle'); setMsg(ml ? 'സമർപ്പിക്കാനായില്ല' : 'Could not submit'); }
    } catch { setState('idle'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">{ml ? 'അഭ്യർത്ഥന പോസ്റ്റ് ചെയ്തു' : 'Request posted'}</p>
        <p className="mt-1 text-sm text-green-700">{ml ? `${msg} ദാതാക്കളെ അറിയിച്ചു.` : `${msg} matching donors alerted.`}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'രക്തഗ്രൂപ്പ് *' : 'Blood group *'}</span>
          <select value={form.blood_group} onChange={(e) => set('blood_group', e.target.value)} className={`mt-1 ${inp}`}>
            <option value="">—</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select></label>
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'ജില്ല *' : 'District *'}</span>
          <select value={form.district_id} onChange={(e) => set('district_id', e.target.value)} className={`mt-1 ${inp}`}>
            <option value="">—</option>{districts.map((d) => <option key={d.id} value={d.id}>{ml ? d.name_ml : d.name_en}</option>)}
          </select></label>
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'യൂണിറ്റുകൾ' : 'Units'}</span>
          <input type="number" min={1} max={20} value={form.units_needed} onChange={(e) => set('units_needed', e.target.value)} className={`mt-1 ${inp}`} /></label>
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'അടിയന്തരത' : 'Urgency'}</span>
          <select value={form.urgency} onChange={(e) => set('urgency', e.target.value)} className={`mt-1 ${inp}`}>
            {URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
          </select></label>
      </div>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'ആശുപത്രി' : 'Hospital'}</span>
        <input value={form.hospital_name} onChange={(e) => set('hospital_name', e.target.value)} maxLength={200} className={`mt-1 ${inp}`} /></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'ബന്ധപ്പെടേണ്ട ഫോൺ *' : 'Contact phone *'}</span>
        <input type="tel" value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} className={`mt-1 ${inp}`} /></label>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === 'busy'} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : (ml ? 'രക്തം അഭ്യർത്ഥിക്കുക' : 'Request blood')}
      </button>
    </form>
  );
}
