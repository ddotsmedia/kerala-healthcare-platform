'use client';

// DataTable — sortable headers, client search, bulk select + bulk actions,
// row-level quick actions, pagination with page-size selector, CSV export.
// Actions call async run(ids|id); on success the acted rows are removed from the
// current view (for approve/reject-style flows). No packages.

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/shell/Toast';

const PAGE_SIZES = [10, 25, 50];
const TONE = {
  green: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  red: 'bg-red-600 hover:bg-red-700 text-white',
  brand: 'bg-brand hover:bg-brand-dark text-white',
  ghost: 'border border-line text-ink hover:border-brand hover:text-brand'
};

function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = columns.map((c) => esc(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => esc(c.exportValue ? c.exportValue(r) : r[c.key])).join(',')).join('\n');
  return `${head}\n${body}\n`;
}

export default function DataTable({
  rows: initial = [], columns = [], getId = (r) => r.id, searchKeys = [],
  bulkActions = [], rowActions = () => [], exportName = 'export', emptyMessage = 'No rows.'
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [sel, setSel] = useState(() => new Set());
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setRows(initial); setSel(new Set()); setPage(1); }, [initial]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = term ? rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(term))) : rows;
    if (sort.key) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (av == null) return 1; if (bv == null) return -1;
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
      });
    }
    return out;
  }, [rows, q, sort, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const pageRows = filtered.slice((page - 1) * size, page * size);
  const allChecked = pageRows.length > 0 && pageRows.every((r) => sel.has(getId(r)));

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));
  const toggleAll = () => setSel((s) => {
    const n = new Set(s);
    if (allChecked) pageRows.forEach((r) => n.delete(getId(r)));
    else pageRows.forEach((r) => n.add(getId(r)));
    return n;
  });
  const toggleOne = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function runBulk(action) {
    const ids = [...sel];
    if (ids.length === 0) return;
    if (action.confirm && !window.confirm(action.confirm.replace('{n}', ids.length))) return;
    setBusy(true);
    try {
      const ok = await action.run(ids);
      if (ok !== false) {
        if (action.removes !== false) setRows((rs) => rs.filter((r) => !sel.has(getId(r))));
        setSel(new Set());
        toast(`${action.label}: ${ids.length} item(s)`, 'success');
      } else toast(`${action.label} failed`, 'error');
    } catch { toast(`${action.label} failed`, 'error'); }
    setBusy(false);
  }

  async function runRow(action, row) {
    const id = getId(row);
    if (action.confirm && !window.confirm(action.confirm)) return;
    setBusy(true);
    try {
      const ok = await action.run(id, row);
      if (ok !== false) {
        if (action.removes !== false) setRows((rs) => rs.filter((r) => getId(r) !== id));
        toast(`${action.label} done`, 'success');
      } else toast(`${action.label} failed`, 'error');
    } catch { toast(`${action.label} failed`, 'error'); }
    setBusy(false);
  }

  function exportCsv() {
    const csv = toCsv(filtered, columns);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${exportName}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…"
          className="w-48 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-soft" />
        <span className="text-xs text-ink-soft">{filtered.length} row(s)</span>
        <div className="ml-auto flex items-center gap-2">
          {sel.size > 0 && bulkActions.map((a) => (
            <button key={a.label} type="button" disabled={busy} onClick={() => runBulk(a)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${TONE[a.tone] || TONE.brand}`}>{a.label} ({sel.size})</button>
          ))}
          <button type="button" onClick={exportCsv} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${TONE.ghost}`}>⬇ CSV</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface py-12 text-center">
          <p className="text-sm text-ink-soft">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-2 text-xs uppercase text-ink-soft">
              <tr>
                {bulkActions.length > 0 && <th className="w-10 px-3 py-2"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" /></th>}
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-2 font-semibold">
                    {c.sortable ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className="flex items-center gap-1 hover:text-brand">
                        {c.label}<span className="text-[10px]">{sort.key === c.key ? (sort.dir > 0 ? '▲' : '▼') : '↕'}</span>
                      </button>
                    ) : c.label}
                  </th>
                ))}
                {rowActions().length >= 0 && <th className="px-3 py-2 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageRows.map((r) => {
                const id = getId(r);
                const acts = rowActions(r);
                return (
                  <tr key={id} className="align-top hover:bg-surface-2">
                    {bulkActions.length > 0 && <td className="px-3 py-2"><input type="checkbox" checked={sel.has(id)} onChange={() => toggleOne(id)} aria-label="Select row" /></td>}
                    {columns.map((c) => <td key={c.key} className="px-3 py-2 text-ink">{c.render ? c.render(r) : r[c.key]}</td>)}
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1.5">
                        {acts.map((a) => (
                          <button key={a.label} type="button" disabled={busy} onClick={() => runRow(a, r)}
                            className={`rounded px-2 py-1 text-xs font-semibold disabled:opacity-60 ${TONE[a.tone] || TONE.ghost}`}>{a.label}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            className="rounded-lg border border-line bg-surface px-2 py-1 text-ink">
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line px-2 py-1 disabled:opacity-40">Prev</button>
          <span>Page {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line px-2 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
