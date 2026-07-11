'use client';

// SecondOpinionForm.js — request a second opinion. POSTs /api/second-opinion.
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecondOpinionForm({ specialties = [], districts = [], records = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [form, setForm] = useState({ urgency: 'routine' });
  const [docs, setDocs] = useState([]);
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleDoc = (id) => setDocs((d) => d.includes(id) ? d.filter((x) => x !== id) : [...d, id]);

  async function submit(e) {
    e.preventDefault();
    if (!form.condition_description) { setMsg(ml ? 'അവസ്ഥ വിവരിക്കുക' : 'Please describe the condition'); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/second-opinion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, documents: docs })
      });
      if (r.status === 401) { window.location.href = `/${locale}/login`; return; }
      if (r.ok) { setState('done'); setForm({ urgency: 'routine' }); setDocs([]); router.refresh(); }
      else { setState('error'); setMsg(ml ? 'സമർപ്പിക്കാനായില്ല' : 'Could not submit'); }
    } catch { setState('error'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  const URG = [['routine', ml ? 'സാധാരണം' : 'Routine'], ['soon', ml ? 'ഉടൻ' : 'Soon'], ['urgent', ml ? 'അടിയന്തരം' : 'Urgent']];

  if (state === 'done') {
    return <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center text-sm font-medium text-green-800">
      {ml ? '✅ അഭ്യർത്ഥന ലഭിച്ചു. ഒരു സ്പെഷ്യലിസ്റ്റുമായി പൊരുത്തപ്പെടുത്തുമ്പോൾ ഞങ്ങൾ അറിയിക്കും.' : '✅ Request received. We will notify you when it is matched to a specialist.'}</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{ml ? 'രണ്ടാം അഭിപ്രായം അഭ്യർത്ഥിക്കുക' : 'Request a second opinion'}</h2>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'അവസ്ഥ വിവരണം *' : 'Describe the condition *'}</span>
        <textarea rows={3} value={form.condition_description || ''} onChange={(e) => set('condition_description', e.target.value)} className={`mt-1 ${inp}`} /></label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'നിലവിലെ രോഗനിർണയം' : 'Existing diagnosis'}</span>
          <textarea rows={2} value={form.existing_diagnosis || ''} onChange={(e) => set('existing_diagnosis', e.target.value)} className={`mt-1 ${inp}`} /></label>
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'നിലവിലെ ചികിത്സ' : 'Existing treatment'}</span>
          <textarea rows={2} value={form.existing_treatment || ''} onChange={(e) => set('existing_treatment', e.target.value)} className={`mt-1 ${inp}`} /></label>
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'സ്പെഷ്യാലിറ്റി' : 'Preferred specialty'}</span>
          <select value={form.preferred_specialty_id || ''} onChange={(e) => set('preferred_specialty_id', e.target.value)} className={`mt-1 ${inp}`}>
            <option value="">{ml ? 'ഏതെങ്കിലും' : 'Any'}</option>
            {specialties.map((s) => <option key={s.id} value={s.id}>{ml ? s.name_ml : s.name_en}</option>)}
          </select></label>
        <label className="block text-sm"><span className="text-gray-700">{ml ? 'ജില്ല' : 'Preferred district'}</span>
          <select value={form.preferred_district_id || ''} onChange={(e) => set('preferred_district_id', e.target.value)} className={`mt-1 ${inp}`}>
            <option value="">{ml ? 'ഏതെങ്കിലും' : 'Any'}</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{ml ? d.name_ml : d.name_en}</option>)}
          </select></label>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="text-gray-700">{ml ? 'അടിയന്തരത:' : 'Urgency:'}</span>
        {URG.map(([v, l]) => <label key={v} className="flex items-center gap-1"><input type="radio" name="urgency" checked={form.urgency === v} onChange={() => set('urgency', v)} /> {l}</label>)}
      </div>
      {records.length > 0 && (
        <div className="text-sm">
          <span className="text-gray-700">{ml ? 'ആരോഗ്യ രേഖകൾ അറ്റാച്ച് ചെയ്യുക' : 'Attach health records'}</span>
          <div className="mt-1 max-h-32 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {records.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={docs.includes(r.id)} onChange={() => toggleDoc(r.id)} /> {r.title} <span className="text-gray-400">({r.record_type})</span></label>
            ))}
          </div>
        </div>
      )}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === 'busy'} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : (ml ? 'അഭ്യർത്ഥന സമർപ്പിക്കുക' : 'Submit request')}
      </button>
    </form>
  );
}
