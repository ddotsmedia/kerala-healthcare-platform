'use client';

// FamilyManager.js — list family members, add (inline form), remove.
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const REL = ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other'];
const REL_ML = { spouse: 'ജീവിതപങ്കാളി', child: 'കുട്ടി', parent: 'രക്ഷിതാവ്', sibling: 'സഹോദരൻ/സഹോദരി', grandparent: 'മുത്തച്ഛൻ/മുത്തശ്ശി', other: 'മറ്റുള്ളവ' };
const BLOOD = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function FamilyManager({ members: initial = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [members, setMembers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ relationship: 'child' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e) {
    e.preventDefault();
    if (!form.name_en) return;
    setBusy(true);
    try {
      const r = await fetch('/api/patient/family', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) { const { data } = await r.json(); setMembers((m) => [...m, data]); setForm({ relationship: 'child' }); setOpen(false); router.refresh(); }
    } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm(ml ? 'നീക്കം ചെയ്യണോ?' : 'Remove this member?')) return;
    const r = await fetch(`/api/patient/family/${id}`, { method: 'DELETE' });
    if (r.ok) setMembers((m) => m.filter((x) => x.id !== id));
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  const relLabel = (r) => ml ? (REL_ML[r] || r) : r;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{ml ? (m.name_ml || m.name_en) : m.name_en}</h3>
                <p className="text-xs text-gray-500">{relLabel(m.relationship)}{m.age != null ? ` · ${m.age} ${ml ? 'വയസ്സ്' : 'yrs'}` : ''}{m.blood_group ? ` · ${m.blood_group}` : ''}</p>
              </div>
              {m.is_minor && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">{ml ? 'പ്രായപൂർത്തിയാകാത്ത' : 'Minor'}</span>}
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <Link href={`/${locale}/patient/health-records?member=${m.id}`} className="font-medium text-brand">{ml ? 'ആരോഗ്യ രേഖകൾ →' : 'Health records →'}</Link>
              <button onClick={() => remove(m.id)} className="text-red-600">{ml ? 'നീക്കം' : 'Remove'}</button>
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <form onSubmit={add} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder={ml ? 'പേര് (English) *' : 'Name (English) *'} required value={form.name_en || ''} onChange={(e) => set('name_en', e.target.value)} className={inp} />
            <input placeholder={ml ? 'പേര് (മലയാളം)' : 'Name (Malayalam)'} value={form.name_ml || ''} onChange={(e) => set('name_ml', e.target.value)} className={inp} />
            <select value={form.relationship} onChange={(e) => set('relationship', e.target.value)} className={inp}>{REL.map((r) => <option key={r} value={r}>{relLabel(r)}</option>)}</select>
            <select value={form.gender || ''} onChange={(e) => set('gender', e.target.value)} className={inp}><option value="">{ml ? 'ലിംഗം' : 'Gender'}</option><option value="male">{ml ? 'പുരുഷൻ' : 'Male'}</option><option value="female">{ml ? 'സ്ത്രീ' : 'Female'}</option><option value="other">{ml ? 'മറ്റുള്ളവ' : 'Other'}</option></select>
            <label className="text-xs text-gray-500">{ml ? 'ജനനത്തീയതി' : 'Date of birth'}<input type="date" value={form.date_of_birth || ''} onChange={(e) => set('date_of_birth', e.target.value)} className={inp} /></label>
            <select value={form.blood_group || ''} onChange={(e) => set('blood_group', e.target.value)} className={inp}><option value="">{ml ? 'രക്തഗ്രൂപ്പ്' : 'Blood group'}</option>{BLOOD.map((b) => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{ml ? 'ചേർക്കുക' : 'Add member'}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">+ {ml ? 'കുടുംബാംഗത്തെ ചേർക്കുക' : 'Add family member'}</button>
      )}
    </div>
  );
}
