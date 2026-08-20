'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

// Bulk import UI — pick type, upload CSV, preview 5 rows, start import, results.
import { useState } from 'react';

export default function ImportClient() {
  const [type, setType] = useState('doctors');
  const [preview, setPreview] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function upload(e) {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) { setMsg('Choose a CSV file'); return; }
    setBusy(true); setMsg(''); setResult(null); setPreview(null);
    const fd = new FormData(); fd.append('file', file); fd.append('type', type);
    try {
      const res = await fetch('/api/import/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (res.status === 201) { setPreview(j.data.preview); setJobId(j.data.id); setTotal(j.data.total); }
      else setMsg(`Upload failed: ${j.errors?.[0] || res.status}`);
    } catch { setMsg('Upload error'); } finally { setBusy(false); }
  }

  async function start() {
    if (!jobId) return;
    setBusy(true); setMsg('');
    try {
      const res = await fetch(`/api/import/${jobId}/execute`, { method: 'POST' });
      const j = await res.json();
      if (res.ok) setResult(j.data); else setMsg(`Import failed: ${j.errors?.[0] || res.status}`);
    } catch { setMsg('Import error'); } finally { setBusy(false); }
  }

  const th = 'px-2 py-1 text-left text-xs font-semibold text-gray-600 whitespace-nowrap';
  const td = 'px-2 py-1 text-xs text-gray-700 whitespace-nowrap';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <a href="/api/import/template/doctors" className="text-sm font-medium text-brand hover:underline">⬇ Doctor template CSV</a>
        <a href="/api/import/template/hospitals" className="text-sm font-medium text-brand hover:underline">⬇ Hospital template CSV</a>
      </div>

      <form onSubmit={upload} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="doctors">Doctors</option>
            <option value="hospitals">Hospitals</option>
          </select>
          <input type="file" name="file" accept=".csv,text/csv" className="text-sm" />
          <button type="submit" disabled={busy} className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? '…' : 'Preview'}
          </button>
        </div>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>

      {preview && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold">Preview — first {preview.rows.length} of {total} rows</p>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>{preview.headers.map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {preview.rows.map((r, i) => <tr key={i}>{preview.headers.map((h) => <td key={h} className={td}>{r[h]}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <button onClick={start} disabled={busy} className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {busy ? 'Importing…' : `Start Import (${total} rows)`}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-2 rounded-xl border-2 border-green-300 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-900">✅ Imported {result.imported} · ⚠ {result.errorRows} errors (of {result.total})</p>
          {result.errorRows > 0 && (
            <>
              <a href={`/api/import/${jobId}/errors`} className="inline-block text-sm font-semibold text-brand hover:underline">⬇ Download error report CSV</a>
              <div className="mt-2 overflow-x-auto rounded border border-red-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-50"><tr><th className={th}>Row</th><th className={th}>Field</th><th className={th}>Error</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.errors.map((e, i) => <tr key={i}><td className={td}>{e.row}</td><td className={td}>{e.field}</td><td className={td}>{e.error_message}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <a href={`/import/${jobId}`} className="inline-block text-sm font-semibold text-brand hover:underline">View job details →</a>
        </div>
      )}
    </div>
  );
}
