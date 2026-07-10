'use client';

// EditPrescription.js — edit metadata + medications; delete. PATCH/DELETE the API.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MedicationsEditor from './MedicationsEditor';

const d10 = (d) => (d ? String(d).slice(0, 10) : '');

export default function EditPrescription({ prescription, locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const p = prescription;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    doctor_name: p.doctor_name || '', hospital_name: p.hospital_name || '',
    prescribed_date: d10(p.prescribed_date), valid_until: d10(p.valid_until), notes: p.notes || ''
  });
  const [meds, setMeds] = useState(Array.isArray(p.medications) ? p.medications : []);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true);
    try {
      const r = await fetch(`/api/patient/prescriptions/${p.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, medications: meds.filter((m) => m.name) })
      });
      if (r.ok) { setOpen(false); router.refresh(); }
    } finally { setBusy(false); }
  }

  async function del() {
    if (!window.confirm(ml ? 'ഈ പ്രിസ്ക്രിപ്ഷൻ ഇല്ലാതാക്കണോ?' : 'Delete this prescription?')) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/patient/prescriptions/${p.id}`, { method: 'DELETE' });
      if (r.ok) router.push(`/${locale}/patient/prescriptions`);
    } finally { setBusy(false); }
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
        <input value={form.doctor_name} onChange={(e) => set('doctor_name', e.target.value)} placeholder={ml ? 'ഡോക്ടർ' : 'Doctor'} className={inp} />
        <input value={form.hospital_name} onChange={(e) => set('hospital_name', e.target.value)} placeholder={ml ? 'ആശുപത്രി' : 'Hospital'} className={inp} />
        <label className="text-xs text-gray-500">{ml ? 'തീയതി' : 'Prescribed'}<input type="date" value={form.prescribed_date} onChange={(e) => set('prescribed_date', e.target.value)} className={inp} /></label>
        <label className="text-xs text-gray-500">{ml ? 'കാലാവധി' : 'Valid until'}<input type="date" value={form.valid_until} onChange={(e) => set('valid_until', e.target.value)} className={inp} /></label>
      </div>
      <MedicationsEditor meds={meds} onChange={setMeds} locale={locale} />
      <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder={ml ? 'കുറിപ്പുകൾ' : 'Notes'} className={inp} />
      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? '…' : (ml ? 'സേവ് ചെയ്യുക' : 'Save')}</button>
        <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
      </div>
    </div>
  );
}
