// CompareTable.js — side-by-side hospital comparison. Uses existing hospital
// fields; boolean facility rows derive from hospital_services.service_slug and
// accreditations. Server component. Horizontal scroll on mobile.

const TYPE_LABELS = {
  government: { ml: 'സർക്കാർ', en: 'Government' }, private: { ml: 'സ്വകാര്യം', en: 'Private' },
  charitable: { ml: 'ചാരിറ്റബിൾ', en: 'Charitable' }, ayurveda: { ml: 'ആയുർവേദം', en: 'Ayurveda' }
};

const svc = (h, slug) => Array.isArray(h.service_slugs) && h.service_slugs.includes(slug);
const accr = (h, body) => Array.isArray(h.accreditations) && h.accreditations.some((b) => String(b).toUpperCase() === body);
const Tick = ({ on }) => on
  ? <span className="font-bold text-green-600" aria-label="yes">✓</span>
  : <span className="text-gray-300" aria-label="no">✗</span>;

export default function CompareTable({ hospitals = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const nm = (h) => (ml ? h.name_ml : h.name_en) || h.name_en;
  const num = (v) => (v == null ? '—' : v);

  const ROWS = [
    { k: 'type', label: ml ? 'തരം' : 'Type', cell: (h) => { const t = TYPE_LABELS[h.type]; return t ? (t[locale] || t.en) : (h.type || '—'); } },
    { k: 'district', label: ml ? 'ജില്ല' : 'District', cell: (h) => (ml ? h.district_ml : h.district_en) || '—' },
    { k: 'rating', label: ml ? 'റേറ്റിംഗ്' : 'Rating', cell: (h) => h.rating_count > 0 ? `⭐ ${Number(h.rating_avg).toFixed(1)} (${h.rating_count})` : '—' },
    { k: 'beds', label: ml ? 'ബെഡുകൾ' : 'Beds', cell: (h) => num(h.bed_count) },
    { k: 'icu', label: ml ? 'ICU ബെഡുകൾ' : 'ICU beds', cell: (h) => num(h.icu_beds) },
    { k: 'nicu', label: ml ? 'NICU ബെഡുകൾ' : 'NICU beds', cell: (h) => num(h.nicu_beds) },
    { k: 'depts', label: ml ? 'സ്പെഷ്യാലിറ്റികൾ' : 'Specialties', cell: (h) => num(Number(h.dept_count) || 0) },
    { k: 'emergency', label: ml ? 'എമർജൻസി 24x7' : 'Emergency 24x7', cell: (h) => <Tick on={h.emergency_24x7 || svc(h, 'emergency')} /> },
    { k: 'dialysis', label: ml ? 'ഡയാലിസിസ്' : 'Dialysis', cell: (h) => <Tick on={svc(h, 'dialysis')} /> },
    { k: 'ivf', label: 'IVF', cell: (h) => <Tick on={svc(h, 'ivf')} /> },
    { k: 'mri', label: 'MRI', cell: (h) => <Tick on={svc(h, 'mri')} /> },
    { k: 'ct', label: 'CT', cell: (h) => <Tick on={svc(h, 'ct')} /> },
    { k: 'nabh', label: 'NABH', cell: (h) => <Tick on={accr(h, 'NABH')} /> },
    { k: 'nabl', label: 'NABL', cell: (h) => <Tick on={accr(h, 'NABL')} /> }
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left text-xs font-semibold uppercase text-gray-400">{ml ? 'താരതമ്യം' : 'Compare'}</th>
            {hospitals.map((h) => (
              <th key={h.id} className="min-w-[140px] px-3 py-3 text-left align-top">
                <a href={`/${locale}/hospitals/${h.slug}`} className="font-semibold text-gray-900 hover:text-brand">{nm(h)}</a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, ri) => (
            <tr key={row.k} className={ri % 2 ? 'bg-white' : 'bg-gray-50/40'}>
              <th className="sticky left-0 z-10 bg-inherit px-3 py-2.5 text-left font-medium text-gray-600">{row.label}</th>
              {hospitals.map((h) => <td key={h.id} className="px-3 py-2.5 text-gray-800">{row.cell(h)}</td>)}
            </tr>
          ))}
          <tr>
            <th className="sticky left-0 z-10 bg-white px-3 py-3" />
            {hospitals.map((h) => (
              <td key={h.id} className="px-3 py-3">
                <a href={`/${locale}/doctors?hospital=${h.slug}`} className="inline-block rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
                  📅 {ml ? 'അപ്പോയിന്റ്മെന്റ്' : 'Book appointment'}
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
