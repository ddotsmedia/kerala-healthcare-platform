// DialysisCard.js — dialysis centre directory item: name, machines, shifts,
// dialysis-type + govt-scheme badges, district, fee. Server component.

export default function DialysisCard({ centre: c, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? c.name_ml : c.name_en) || c.name_en;
  const district = ml ? c.district_ml : c.district_en;
  const shifts = Array.isArray(c.shift_timings) ? c.shift_timings : [];
  const types = [c.has_hd && 'HD', c.has_pd && 'PD', c.has_hdf && 'HDF'].filter(Boolean);
  return (
    <a href={`/${locale}/dialysis/${c.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {c.accepts_govt_scheme && <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">{ml ? 'സർക്കാർ പദ്ധതി' : 'Govt scheme'}</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        {c.machine_count != null && <span>🩺 {c.machine_count} {ml ? 'മെഷീനുകൾ' : 'machines'}</span>}
        {c.fee_per_session_inr != null && <span>₹{c.fee_per_session_inr}{ml ? '/സെഷൻ' : '/session'}</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {types.map((t) => <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{t}</span>)}
        {shifts.slice(0, 4).map((s, i) => <span key={i} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{s.shift}{s.time ? ` ${s.time}` : ''}</span>)}
      </div>
    </a>
  );
}
