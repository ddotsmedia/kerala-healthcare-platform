'use client';

// UploadPrescription.js — modal with drag-drop file zone + metadata + medications.
// POSTs multipart to /api/patient/prescriptions, then refreshes.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MedicationsEditor from './MedicationsEditor';

const MAX_KB = 2048;
const ACCEPT = ['image/jpeg', 'image/png', 'application/pdf'];

export default function UploadPrescription({ locale = 'ml', memberId = '' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState({});
  const [state, setState] = useState('idle'); // idle|busy|error
  const [msg, setMsg] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function pickFile(f) {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) { setMsg(ml ? 'jpg, png, pdf മാത്രം' : 'Only jpg, png, pdf'); return; }
    if (f.size / 1024 > MAX_KB) { setMsg(ml ? 'ഫയൽ 2MB-യിൽ കൂടരുത്' : 'File must be under 2MB'); return; }
    setMsg(''); setFile(f);
  }

  async function submit(e) {
    e.preventDefault();
    setState('busy'); setMsg('');
    const fd = new FormData();
    if (file) fd.append('file', file);
    for (const k of ['doctor_name', 'hospital_name', 'prescribed_date', 'valid_until', 'notes']) if (form[k]) fd.append(k, form[k]);
    fd.append('medications', JSON.stringify(meds.filter((m) => m.name)));
    if (memberId) fd.append('family_member_id', memberId);
    try {
      const r = await fetch('/api/patient/prescriptions', { method: 'POST', body: fd });
      if (r.status === 401) { window.location.href = `/${locale}/login`; return; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); setState('error'); setMsg((j.errors && j.errors[0]) || (ml ? 'അപ്‌ലോഡ് പരാജയപ്പെട്ടു' : 'Upload failed')); return; }
      setOpen(false); setFile(null); setMeds([]); setForm({}); router.refresh();
      setState('idle');
    } catch { setState('error'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        ⬆️ {ml ? 'പ്രിസ്ക്രിപ്ഷൻ അപ്‌ലോഡ്' : 'Upload prescription'}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submit} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">{ml ? 'പ്രിസ്ക്രിപ്ഷൻ അപ്‌ലോഡ്' : 'Upload prescription'}</h3>

              <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-center hover:border-brand">
                <span className="text-2xl">📄</span>
                <span className="mt-1 text-sm text-gray-600">{file ? file.name : (ml ? 'ഫയൽ ഇവിടെ വലിച്ചിടുക അല്ലെങ്കിൽ ടാപ്പ് ചെയ്യുക' : 'Drag & drop or tap to choose')}</span>
                <span className="text-[11px] text-gray-400">jpg, png, pdf · ≤ 2MB</span>
                <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={(e) => pickFile(e.target.files[0])} />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input placeholder={ml ? 'ഡോക്ടർ' : 'Doctor name'} value={form.doctor_name || ''} onChange={(e) => set('doctor_name', e.target.value)} className={inp} />
                <input placeholder={ml ? 'ആശുപത്രി' : 'Hospital'} value={form.hospital_name || ''} onChange={(e) => set('hospital_name', e.target.value)} className={inp} />
                <label className="text-xs text-gray-500">{ml ? 'തീയതി' : 'Prescribed'}<input type="date" value={form.prescribed_date || ''} onChange={(e) => set('prescribed_date', e.target.value)} className={inp} /></label>
                <label className="text-xs text-gray-500">{ml ? 'കാലാവധി' : 'Valid until'}<input type="date" value={form.valid_until || ''} onChange={(e) => set('valid_until', e.target.value)} className={inp} /></label>
              </div>

              <MedicationsEditor meds={meds} onChange={setMeds} locale={locale} />
              <textarea placeholder={ml ? 'കുറിപ്പുകൾ' : 'Notes'} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={2} className={inp} />

              {msg && <p className="text-sm text-red-600">{msg}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={state === 'busy'} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {state === 'busy' ? (ml ? 'സേവ് ചെയ്യുന്നു…' : 'Saving…') : (ml ? 'സേവ് ചെയ്യുക' : 'Save')}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
