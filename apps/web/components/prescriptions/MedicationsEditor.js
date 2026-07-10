'use client';

// MedicationsEditor.js — add/edit/remove medication rows. Controlled by parent.
export default function MedicationsEditor({ meds = [], onChange, locale = 'ml' }) {
  const ml = locale === 'ml';
  const set = (i, k, v) => onChange(meds.map((m, idx) => idx === i ? { ...m, [k]: v } : m));
  const add = () => onChange([...meds, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const remove = (i) => onChange(meds.filter((_, idx) => idx !== i));
  const inp = 'rounded-lg border border-gray-300 px-2 py-1 text-sm';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{ml ? 'മരുന്നുകൾ' : 'Medications'}</span>
        <button type="button" onClick={add} className="rounded-lg border border-brand px-2 py-1 text-xs font-medium text-brand">+ {ml ? 'ചേർക്കുക' : 'Add'}</button>
      </div>
      {meds.length === 0 && <p className="text-xs text-gray-400">{ml ? 'മരുന്നുകൾ ചേർത്തിട്ടില്ല' : 'No medications added'}</p>}
      {meds.map((m, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-2">
          <div className="grid grid-cols-2 gap-1.5">
            <input value={m.name || ''} onChange={(e) => set(i, 'name', e.target.value)} placeholder={ml ? 'പേര്' : 'Name'} className={inp} />
            <input value={m.dosage || ''} onChange={(e) => set(i, 'dosage', e.target.value)} placeholder={ml ? 'ഡോസ്' : 'Dosage'} className={inp} />
            <input value={m.frequency || ''} onChange={(e) => set(i, 'frequency', e.target.value)} placeholder={ml ? 'ആവൃത്തി' : 'Frequency'} className={inp} />
            <input value={m.duration || ''} onChange={(e) => set(i, 'duration', e.target.value)} placeholder={ml ? 'കാലാവധി' : 'Duration'} className={inp} />
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <input value={m.notes || ''} onChange={(e) => set(i, 'notes', e.target.value)} placeholder={ml ? 'കുറിപ്പ്' : 'Notes'} className={`${inp} flex-1`} />
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-600">{ml ? 'നീക്കം' : 'Remove'}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
