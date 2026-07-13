'use client';

// GoalsManager.js — health goals: progress cards, add modal, delete.
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GOAL_TYPES, goalByKey, progressPct, isAchieved } from '@/lib/goalConfig';

function daysLeft(target) {
  if (!target) return null;
  return Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
}

function GoalCard({ g, locale, onDelete }) {
  const ml = locale === 'ml';
  const cfg = goalByKey(g.goal_type);
  const title = (ml ? g.title_ml : g.title_en) || (cfg ? (ml ? cfg.ml : cfg.en) : g.goal_type);
  const unit = g.target_unit || (cfg ? cfg.unit : '');
  const pct = progressPct(g);
  const achieved = g.status === 'achieved' || isAchieved(g);
  const dl = daysLeft(g.target_date);

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${achieved ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{achieved && '🎉 '}{title}</h3>
        <button onClick={() => onDelete(g.id)} className="text-xs text-gray-400 hover:text-red-600">✕</button>
      </div>
      <div className="mt-1 flex items-baseline gap-2 text-sm">
        <span className="text-2xl font-bold text-gray-900">{g.current_value ?? '—'}</span>
        <span className="text-gray-500">/ {g.target_value ?? '—'} {unit}</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${achieved ? 'bg-green-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
        <span>{pct}%{achieved ? ` · ${ml ? 'നേടി!' : 'Achieved!'}` : ''}</span>
        {dl != null && !achieved && <span>{dl >= 0 ? `${dl} ${ml ? 'ദിവസം ബാക്കി' : 'days left'}` : (ml ? 'കാലാവധി കഴിഞ്ഞു' : 'overdue')}</span>}
      </div>
      {cfg && cfg.metricType && (
        <Link href={`/${locale}/patient/health-tracker`} className="mt-2 inline-block text-xs font-medium text-brand">📈 {ml ? 'ഈ അളവ് ട്രാക്ക് ചെയ്യുക →' : 'Track this metric →'}</Link>
      )}
    </div>
  );
}

export default function GoalsManager({ goals: initial = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [goals, setGoals] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ goal_type: 'weight' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/patient/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) { const { data } = await r.json(); setGoals((g) => [data, ...g]); setForm({ goal_type: 'weight' }); setOpen(false); router.refresh(); }
    } finally { setBusy(false); }
  }
  async function remove(id) {
    const r = await fetch(`/api/patient/goals/${id}`, { method: 'DELETE' });
    if (r.ok) setGoals((g) => g.filter((x) => x.id !== id));
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  const isCustom = form.goal_type === 'custom';

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {goals.map((g) => <GoalCard key={g.id} g={g} locale={locale} onDelete={remove} />)}
      </div>

      {open ? (
        <form onSubmit={add} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <select value={form.goal_type} onChange={(e) => set('goal_type', e.target.value)} className={inp}>
            {GOAL_TYPES.map((t) => <option key={t.key} value={t.key}>{ml ? t.ml : t.en}</option>)}
          </select>
          {isCustom && <input placeholder={ml ? 'ലക്ഷ്യത്തിന്റെ പേര്' : 'Goal title'} value={ml ? (form.title_ml || '') : (form.title_en || '')} onChange={(e) => set(ml ? 'title_ml' : 'title_en', e.target.value)} className={inp} />}
          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.01" placeholder={ml ? 'ലക്ഷ്യ മൂല്യം' : 'Target value'} value={form.target_value || ''} onChange={(e) => set('target_value', e.target.value)} className={inp} />
            <input type="number" step="0.01" placeholder={ml ? 'ഇപ്പോഴത്തെ മൂല്യം' : 'Start value'} value={form.start_value || ''} onChange={(e) => set('start_value', e.target.value)} className={inp} />
            {isCustom && <input placeholder={ml ? 'യൂണിറ്റ്' : 'Unit'} value={form.target_unit || ''} onChange={(e) => set('target_unit', e.target.value)} className={inp} />}
            <label className="text-xs text-gray-500">{ml ? 'ലക്ഷ്യ തീയതി' : 'Target date'}<input type="date" value={form.target_date || ''} onChange={(e) => set('target_date', e.target.value)} className={inp} /></label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{ml ? 'ലക്ഷ്യം ചേർക്കുക' : 'Add goal'}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">+ {ml ? 'ലക്ഷ്യം ചേർക്കുക' : 'Add a goal'}</button>
      )}
    </div>
  );
}
