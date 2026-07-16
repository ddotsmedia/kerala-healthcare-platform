'use client';

// DonorForm.js — register/update donor profile + availability toggle if registered.
import { useState } from 'react';
import { BLOOD_GROUPS } from '@/lib/bloodConstants';

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default function DonorForm({ districts = [], profile = null, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [form, setForm] = useState({
    blood_group: profile?.blood_group || '', district_id: profile?.district_id || '',
    last_donation_date: profile?.last_donation_date ? String(profile.last_donation_date).slice(0, 10) : '',
    is_available: profile ? profile.is_available : true,
    notify_by_email: profile ? profile.notify_by_email : true,
    notify_by_sms: profile ? profile.notify_by_sms : false, medical_conditions: ''
  });
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.blood_group || !form.district_id) { setMsg(ml ? 'രക്തഗ്രൂപ്പും ജില്ലയും നൽകുക' : 'Blood group and district are required'); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/blood-donors/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (r.status === 401) { window.location.href = `/${locale}/login?returnUrl=/${locale}/donate-blood`; return; }
      if (r.ok) { setState('done'); } else { setState('idle'); setMsg(ml ? 'സമർപ്പിക്കാനായില്ല' : 'Could not submit'); }
    } catch { setState('idle'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-3xl">🩸</div>
        <p className="mt-2 font-semibold text-green-800">{ml ? 'നന്ദി! നിങ്ങൾ രജിസ്റ്റർ ചെയ്തു.' : 'Thank you! You are registered.'}</p>
        <p className="mt-1 text-sm text-green-700">{ml ? 'നിങ്ങളുടെ ജില്ലയിൽ രക്തം ആവശ്യമുള്ളപ്പോൾ അറിയിക്കും.' : "We'll alert you when blood is needed in your district."}</p>
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
      </div>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'അവസാനം രക്തദാനം ചെയ്ത തീയതി' : 'Last donation date'}</span>
        <input type="date" value={form.last_donation_date} onChange={(e) => set('last_donation_date', e.target.value)} className={`mt-1 ${inp}`} /></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'ആരോഗ്യ വിവരങ്ങൾ (ഐച്ഛികം)' : 'Medical conditions (optional)'}</span>
        <textarea value={form.medical_conditions} onChange={(e) => set('medical_conditions', e.target.value)} rows={2} maxLength={1000} className={`mt-1 ${inp}`} /></label>
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} /> {ml ? 'ഇപ്പോൾ രക്തദാനത്തിന് ലഭ്യമാണ്' : 'Available to donate now'}</label>
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.notify_by_email} onChange={(e) => set('notify_by_email', e.target.checked)} /> {ml ? 'ഇമെയിൽ വഴി അറിയിക്കുക' : 'Notify me by email'}</label>
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.notify_by_sms} onChange={(e) => set('notify_by_sms', e.target.checked)} /> {ml ? 'SMS വഴി അറിയിക്കുക' : 'Notify me by SMS'}</label>
      </div>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === 'busy'} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : profile ? (ml ? 'അപ്ഡേറ്റ് ചെയ്യുക' : 'Update profile') : (ml ? 'ദാതാവായി രജിസ്റ്റർ ചെയ്യുക' : 'Register as donor')}
      </button>
    </form>
  );
}
