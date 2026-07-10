'use client';

// EditLabReport.js — edit metadata + results; delete. PATCH/DELETE the API.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { REPORT_TYPES } from '@/lib/labMarkers';
import ResultsEditor from './ResultsEditor';

const d10 = (d) => (d ? String(d).slice(0, 10) : '');

export default function EditLabReport({ report, locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const r = report;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    lab_name: r.lab_name || '', report_date: d10(r.report_date), report_type: r.report_type || '',
    ordered_by_doctor: r.ordered_by_doctor || '', notes: r.notes || ''
  });
  const [results, setResults] = useState(r.results && typeof r.results === 'object' ? r.results : {});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/patient/lab-reports/${r.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, results })
      });
      if (res.ok) { setOpen(false); router.refresh(); }
    } finally { setBusy(false); }
  }
  async function del() {
    if (!window.confirm(ml ? 'ഈ റിപ്പോർട്ട് ഇല്ലാതാക്കണോ?' : 'Delete this report?')) return;
    setBusy(true);
    try { const res = await fetch(`/api/patient/lab-reports/${r.id}`, { method: 'DELETE' }); if (res.ok) router.push(`/${locale}/patient/lab-reports`); }
    finally { setBusy(false); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  if (!open) {
    return (
      <div className="flex gap-2">
        <button onClick={() => setOpen(true)} className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand">✏️ {ml ? 'എഡിറ്റ്' : 'Edit'}</button>
        <button onClick={del} disabled={busy} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-50">🗑 {ml ? 'ഇല്ലാതാക്കുക' : 'Delete'}</button>
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-2">
        <input value={form.lab_name} onChange={(e) => set('lab_name', e.target.value)} placeholder={ml ? 'ലാബ്' : 'Lab'} className={inp} />
        <select value={form.report_type} onChange={(e) => set('report_type', e.target.value)} className={inp}><option value="">{ml ? 'തരം' : 'Type'}</option>{REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <label className="text-xs text-gray-500">{ml ? 'തീയതി' : 'Date'}<input type="date" value={form.report_date} onChange={(e) => set('report_date', e.target.value)} className={inp} /></label>
        <input value={form.ordered_by_doctor} onChange={(e) => set('ordered_by_doctor', e.target.value)} placeholder={ml ? 'ഡോക്ടർ' : 'Ordered by'} className={inp} />
      </div>
      <ResultsEditor results={results} onChange={setResults} locale={locale} />
      <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder={ml ? 'കുറിപ്പുകൾ' : 'Notes'} className={inp} />
      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? '…' : (ml ? 'സേവ് ചെയ്യുക' : 'Save')}</button>
        <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
      </div>
    </div>
  );
}
