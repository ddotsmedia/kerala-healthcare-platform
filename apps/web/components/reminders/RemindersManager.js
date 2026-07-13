'use client';

// RemindersManager.js — medication reminders: list, add, toggle on/off, remove.
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DAYS = [['S', 0], ['M', 1], ['T', 2], ['W', 3], ['T', 4], ['F', 5], ['S', 6]];
const DAYS_ML = ['ഞാ', 'തി', 'ചൊ', 'ബു', 'വ്യാ', 'വെ', 'ശ'];

export default function RemindersManager({ reminders: initial = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ times: ['08:00'], days: [0, 1, 2, 3, 4, 5, 6] });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setTime = (i, v) => set('times', form.times.map((t, idx) => idx === i ? v : t));
  const addTime = () => set('times', [...form.times, '20:00']);
  const rmTime = (i) => set('times', form.times.filter((_, idx) => idx !== i));
  const toggleDay = (d) => set('days', form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d]);

  async function add(e) {
    e.preventDefault();
    if (!form.medication_name || !form.times.length) return;
    setBusy(true);
    try {
      const r = await fetch('/api/patient/medication-reminders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medication_name: form.medication_name, dosage: form.dosage, reminder_times: form.times, days_of_week: form.days, start_date: form.start_date || null, end_date: form.end_date || null })
      });
      if (r.ok) { const { data } = await r.json(); setList((l) => [data, ...l]); setForm({ times: ['08:00'], days: [0, 1, 2, 3, 4, 5, 6] }); setOpen(false); router.refresh(); }
    } finally { setBusy(false); }
  }
  async function toggle(id, is_active) {
    const r = await fetch(`/api/patient/medication-reminders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active }) });
    if (r.ok) setList((l) => l.map((x) => x.id === id ? { ...x, is_active } : x));
  }
  async function remove(id) {
    const r = await fetch(`/api/patient/medication-reminders/${id}`, { method: 'DELETE' });
    if (r.ok) setList((l) => l.filter((x) => x.id !== id));
  }

  const inp = 'rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
  const dayLabel = (i) => (ml ? DAYS_ML[i] : DAYS[i][0]);

  return (
    <div className="space-y-4">
      {list.map((m) => {
        const times = Array.isArray(m.reminder_times) ? m.reminder_times.map((t) => String(t).slice(0, 5)) : [];
        const days = Array.isArray(m.days_of_week) ? m.days_of_week : [];
        return (
          <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className={m.is_active ? '' : 'opacity-50'}>
                <h3 className="font-semibold text-gray-900">💊 {m.medication_name}{m.dosage ? ` · ${m.dosage}` : ''}</h3>
                <p className="mt-0.5 text-xs text-gray-500">🕐 {times.join(', ')} · {days.length === 7 ? (ml ? 'എല്ലാ ദിവസവും' : 'Daily') : days.map(dayLabel).join(' ')}{m.end_date ? ` · ${ml ? 'വരെ' : 'until'} ${String(m.end_date).slice(0, 10)}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button role="switch" aria-checked={m.is_active} onClick={() => toggle(m.id, !m.is_active)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${m.is_active ? 'bg-brand' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${m.is_active ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <button onClick={() => remove(m.id)} className="text-xs text-gray-400 hover:text-red-600">✕</button>
              </div>
            </div>
          </div>
        );
      })}

      {open ? (
        <form onSubmit={add} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder={ml ? 'മരുന്നിന്റെ പേര് *' : 'Medication name *'} required value={form.medication_name || ''} onChange={(e) => set('medication_name', e.target.value)} className={inp} />
            <input placeholder={ml ? 'ഡോസ്' : 'Dosage'} value={form.dosage || ''} onChange={(e) => set('dosage', e.target.value)} className={inp} />
          </div>
          <div>
            <span className="text-xs text-gray-600">{ml ? 'സമയങ്ങൾ' : 'Times'}</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {form.times.map((t, i) => (
                <span key={i} className="flex items-center gap-1"><input type="time" value={t} onChange={(e) => setTime(i, e.target.value)} className={inp} />{form.times.length > 1 && <button type="button" onClick={() => rmTime(i)} className="text-xs text-red-600">✕</button>}</span>
              ))}
              <button type="button" onClick={addTime} className="rounded-lg border border-brand px-2 py-1 text-xs text-brand">+ {ml ? 'സമയം' : 'time'}</button>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-600">{ml ? 'ദിവസങ്ങൾ' : 'Days'}</span>
            <div className="mt-1 flex gap-1">
              {DAYS.map(([, d]) => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`h-8 w-8 rounded-full text-xs font-medium ${form.days.includes(d) ? 'bg-brand text-white' : 'border border-gray-300 text-gray-600'}`}>{dayLabel(d)}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-500">{ml ? 'ആരംഭ തീയതി' : 'Start'}<input type="date" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} className={`${inp} w-full`} /></label>
            <label className="text-xs text-gray-500">{ml ? 'അവസാന തീയതി' : 'End'}<input type="date" value={form.end_date || ''} onChange={(e) => set('end_date', e.target.value)} className={`${inp} w-full`} /></label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{ml ? 'ഓർമ്മപ്പെടുത്തൽ ചേർക്കുക' : 'Add reminder'}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">+ {ml ? 'ഓർമ്മപ്പെടുത്തൽ ചേർക്കുക' : 'Add a reminder'}</button>
      )}
    </div>
  );
}
