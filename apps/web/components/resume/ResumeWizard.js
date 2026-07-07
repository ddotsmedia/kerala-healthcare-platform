'use client';

// Resume builder — 5-step wizard, live preview, AI enhance, autosave, print.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Step1, Step2, Step3, Step4 } from './ResumeSteps';
import ResumePreview from './ResumePreview';

const BLANK = {
  id: null, title: '', template_id: 'kerala_classic', personal: {}, experience: [],
  education: [], skills: [], certifications: [], publications: [], languages: [], refs: [],
  ai_enhanced_summary: ''
};

const TEMPLATES = [
  ['kerala_classic', 'Kerala Classic'],
  ['modern_minimal', 'Modern Minimal'],
  ['gulf_ready', 'Gulf Ready']
];

const EDITABLE = ['title', 'template_id', 'personal', 'experience', 'education', 'skills',
  'certifications', 'publications', 'languages', 'refs', 'ai_enhanced_summary'];

export default function ResumeWizard({ initial, locale = 'ml' }) {
  const ml = locale === 'ml';
  const tr = useCallback((en, mlS) => (ml ? mlS : en), [ml]);
  const [r, setR] = useState({ ...BLANK, ...(initial || {}) });
  const [step, setStep] = useState(1);
  const [view, setView] = useState('form'); // mobile: form|preview
  const [status, setStatus] = useState('saved'); // saved|dirty|saving|error
  const [enhance, setEnhance] = useState(null); // {loading,before,after,error}
  const rRef = useRef(r);
  rRef.current = r;
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const touch = (updater) => { setR((prev) => ({ ...updater(prev) })); dirtyRef.current = true; setStatus('dirty'); };
  const setField = (k, v) => touch((p) => ({ ...p, [k]: v }));
  const setPersonal = (k, v) => touch((p) => ({ ...p, personal: { ...p.personal, [k]: v } }));
  const addItem = (sec, obj) => touch((p) => ({ ...p, [sec]: [...(p[sec] || []), obj] }));
  const setItem = (sec, i, k, v) => touch((p) => ({ ...p, [sec]: p[sec].map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const removeItem = (sec, i) => touch((p) => ({ ...p, [sec]: p[sec].filter((_, idx) => idx !== i) }));

  const payload = (src) => EDITABLE.reduce((o, k) => { o[k] = src[k]; return o; }, {});

  const persist = useCallback(async () => {
    if (savingRef.current) return rRef.current.id;
    savingRef.current = true;
    dirtyRef.current = false;
    setStatus('saving');
    try {
      const cur = rRef.current;
      let id = cur.id;
      if (!id) {
        const cr = await fetch('/api/resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: cur.title || 'My Resume', template_id: cur.template_id }) });
        if (cr.status === 401) { window.location.href = `/${locale}/login`; return null; }
        const { data } = await cr.json();
        id = data.id; setR((p) => ({ ...p, id }));
      }
      const res = await fetch(`/api/resume/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(rRef.current)) });
      setStatus(res.ok ? 'saved' : 'error');
      return id;
    } catch { setStatus('error'); return null; }
    finally { savingRef.current = false; }
  }, [locale]);

  // Autosave every 30s when there are unsaved edits.
  useEffect(() => {
    const t = setInterval(() => { if (dirtyRef.current && !savingRef.current) persist(); }, 30000);
    return () => clearInterval(t);
  }, [persist]);

  async function ensureSaved() { return rRef.current.id || await persist(); }

  async function runEnhance() {
    setEnhance({ loading: true });
    const id = await ensureSaved();
    if (!id) { setEnhance({ error: true }); return; }
    try {
      const res = await fetch(`/api/resume/${id}/enhance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale }) });
      if (res.status === 429) { setEnhance({ error: 'limit' }); return; }
      if (!res.ok) { setEnhance({ error: true }); return; }
      const { data } = await res.json();
      setEnhance({ before: data.before, after: data.after });
    } catch { setEnhance({ error: true }); }
  }

  function acceptEnhance(text) { setField('ai_enhanced_summary', text); setEnhance(null); persist(); }

  async function downloadPdf() {
    const id = await ensureSaved();
    if (id) window.open(`/api/resume/${id}/export?template=${r.template_id}&locale=${locale}&print=1`, '_blank');
  }

  const ctl = { r, setField, setPersonal, addItem, setItem, removeItem, tr };
  const STEPS = [
    tr('Personal', 'വ്യക്തിഗതം'), tr('Experience', 'പരിചയം'),
    tr('Education', 'വിദ്യാഭ്യാസം'), tr('Skills', 'നൈപുണ്യം'), tr('Preview', 'പ്രിവ്യൂ')
  ];
  const statusText = { saved: tr('Saved', 'സേവ് ചെയ്തു'), dirty: tr('Unsaved', 'സേവ് ചെയ്തിട്ടില്ല'), saving: tr('Saving…', 'സേവ് ചെയ്യുന്നു…'), error: tr('Save failed', 'സേവ് പരാജയപ്പെട്ടു') }[status];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{tr('Resume Builder', 'റെസ്യൂം ബിൽഡർ')}</h1>
        <span className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>● {statusText}</span>
      </div>

      {/* stepper */}
      <ol className="flex gap-1 overflow-x-auto text-xs">
        {STEPS.map((s, i) => (
          <li key={i}><button onClick={() => setStep(i + 1)}
            className={`whitespace-nowrap rounded-full px-3 py-1 font-medium ${step === i + 1 ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}. {s}</button></li>
        ))}
      </ol>

      {/* mobile view toggle */}
      <div className="flex gap-2 lg:hidden">
        <button onClick={() => setView('form')} className={`flex-1 rounded-lg py-1.5 text-sm ${view === 'form' ? 'bg-brand text-white' : 'border border-gray-300'}`}>{tr('Edit', 'എഡിറ്റ്')}</button>
        <button onClick={() => setView('preview')} className={`flex-1 rounded-lg py-1.5 text-sm ${view === 'preview' ? 'bg-brand text-white' : 'border border-gray-300'}`}>{tr('Preview', 'പ്രിവ്യൂ')}</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${view === 'preview' ? 'hidden' : ''} lg:block`}>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {step === 1 && (<><Step1 ctl={ctl} />
              <button onClick={runEnhance} className="mt-3 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white">✨ {tr('Enhance summary with AI', 'AI ഉപയോഗിച്ച് സംഗ്രഹം മെച്ചപ്പെടുത്തുക')}</button></>)}
            {step === 2 && <Step2 ctl={ctl} />}
            {step === 3 && <Step3 ctl={ctl} />}
            {step === 4 && <Step4 ctl={ctl} />}
            {step === 5 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{tr('Choose template', 'ടെംപ്ലേറ്റ് തിരഞ്ഞെടുക്കുക')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map(([id, name]) => (
                    <button key={id} onClick={() => setField('template_id', id)}
                      className={`rounded-lg border p-2 text-xs font-medium ${r.template_id === id ? 'border-brand bg-teal-50 text-brand' : 'border-gray-300 text-gray-600'}`}>{name}</button>
                  ))}
                </div>
                <button onClick={downloadPdf} className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white">⬇ {tr('Download PDF', 'PDF ഡൗൺലോഡ്')}</button>
                <p className="text-xs text-gray-500">{tr('Opens the print dialog — choose "Save as PDF".', 'പ്രിന്റ് ഡയലോഗ് തുറക്കും — "Save as PDF" തിരഞ്ഞെടുക്കുക.')}</p>
              </div>
            )}
            <div className="mt-4 flex justify-between">
              <button disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40">{tr('Back', 'പിന്നോട്ട്')}</button>
              <button onClick={persist} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">{tr('Save', 'സേവ്')}</button>
              <button disabled={step === 5} onClick={() => { persist(); setStep((s) => Math.min(5, s + 1)); }} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{tr('Next', 'അടുത്തത്')}</button>
            </div>
          </div>
        </div>

        <div className={`${view === 'form' ? 'hidden' : ''} lg:block`}>
          <ResumePreview resume={r} templateId={r.template_id} locale={locale} />
        </div>
      </div>

      {enhance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !enhance.loading && setEnhance(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold">✨ {tr('AI-enhanced summary', 'AI സംഗ്രഹം')}</h3>
            <p className="mt-1 text-xs text-gray-500">{tr('AI-generated. Review before use.', 'AI ജനറേറ്റഡ്. ഉപയോഗിക്കുന്നതിന് മുമ്പ് പരിശോധിക്കുക.')}</p>
            {enhance.loading && <p className="py-6 text-center text-sm text-gray-500">{tr('Generating…', 'ജനറേറ്റ് ചെയ്യുന്നു…')}</p>}
            {enhance.error && <p className="py-6 text-center text-sm text-red-600">{enhance.error === 'limit' ? tr('Daily AI limit reached (10).', 'ദിവസേനയുള്ള AI പരിധി (10) എത്തി.') : tr('Could not generate. Try again.', 'ജനറേറ്റ് ചെയ്യാനായില്ല.')}</p>}
            {enhance.after && (
              <div className="mt-3 space-y-3">
                {enhance.before && <div><p className="text-xs font-medium text-gray-400">{tr('Before', 'മുമ്പ്')}</p><p className="text-sm text-gray-500">{enhance.before}</p></div>}
                <div><p className="text-xs font-medium text-brand">{tr('After', 'ശേഷം')}</p><textarea defaultValue={enhance.after} onChange={(e) => setEnhance((s) => ({ ...s, after: e.target.value }))} rows={5} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                <div className="flex gap-2">
                  <button onClick={() => acceptEnhance(enhance.after)} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white">{tr('Use this', 'ഇത് ഉപയോഗിക്കുക')}</button>
                  <button onClick={() => setEnhance(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{tr('Cancel', 'റദ്ദാക്കുക')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
