'use client';

import { useState } from 'react';
import { issuePrescriptionAction } from './actions';

const BLANK = { drug: '', dosage: '', frequency: '', duration: '', notes: '' };

export default function PrescriptionForm({ appointmentId }) {
  const [meds, setMeds] = useState([{ ...BLANK }]);

  const update = (i, field, value) =>
    setMeds((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  const addRow = () => setMeds((m) => [...m, { ...BLANK }]);
  const removeRow = (i) => setMeds((m) => (m.length > 1 ? m.filter((_, idx) => idx !== i) : m));

  return (
    <form action={issuePrescriptionAction} className="space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="medications" value={JSON.stringify(meds)} />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Medications</h3>
        {meds.map((m, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
            <div className="flex gap-2">
              <input value={m.drug} onChange={(e) => update(i, 'drug', e.target.value)} placeholder="Drug name"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <button type="button" onClick={() => removeRow(i)} className="rounded-lg px-2 text-gray-400 hover:text-red-500" aria-label="Remove">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input value={m.dosage} onChange={(e) => update(i, 'dosage', e.target.value)} placeholder="Dosage (500mg)" className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
              <input value={m.frequency} onChange={(e) => update(i, 'frequency', e.target.value)} placeholder="Frequency (1-0-1)" className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
              <input value={m.duration} onChange={(e) => update(i, 'duration', e.target.value)} placeholder="Duration (5 days)" className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
            </div>
            <input value={m.notes} onChange={(e) => update(i, 'notes', e.target.value)} placeholder="Notes (after food…)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        ))}
        <button type="button" onClick={addRow} className="text-sm font-semibold text-brand hover:underline">+ Add medication</button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Additional instructions</label>
        <textarea name="instructions" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Next visit</label>
          <input type="date" name="nextVisit" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold text-gray-700">Digital signature (optional)</label>
          <input name="signature" placeholder="Dr. name / reg no." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <button className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-white">Issue Prescription</button>
    </form>
  );
}
