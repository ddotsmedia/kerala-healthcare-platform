// FertilityCard.js — fertility centre directory item: treatments, self-reported
// success rate (flagged), sperm-bank/egg-donation, district. Server component.

const TREAT_LABELS = {
  ivf: 'IVF', iui: 'IUI', icsi: 'ICSI',
  egg_freezing: { ml: 'എഗ് ഫ്രീസിംഗ്', en: 'Egg freezing' },
  embryo_freezing: { ml: 'എംബ്രിയോ ഫ്രീസിംഗ്', en: 'Embryo freezing' },
  donor_egg: { ml: 'ഡോണർ എഗ്', en: 'Donor egg' },
  surrogacy_consultation: { ml: 'സറോഗസി കൺസൾട്ടേഷൻ', en: 'Surrogacy consult' },
  male_infertility: { ml: 'പുരുഷ വന്ധ്യത', en: 'Male infertility' },
  sperm_bank: { ml: 'സ്‌പേം ബാങ്ക്', en: 'Sperm bank' }
};
const label = (t, ml) => { const l = TREAT_LABELS[t]; return typeof l === 'string' ? l : (l ? (ml ? l.ml : l.en) : t); };

export default function FertilityCard({ centre: f, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = (ml ? f.name_ml : f.name_en) || f.name_en;
  const district = ml ? f.district_ml : f.district_en;
  const treatments = Array.isArray(f.treatments) ? f.treatments : [];
  return (
    <a href={`/${locale}/fertility/${f.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{name}</h3>
        {f.rating_count > 0 && <span className="shrink-0 text-xs font-medium text-amber-600">⭐ {Number(f.rating_avg).toFixed(1)} ({f.rating_count})</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        {f.established_year != null && <span>{ml ? 'സ്ഥാപിതം' : 'Est.'} {f.established_year}</span>}
        {f.consultation_fee_inr != null && <span>₹{f.consultation_fee_inr}</span>}
      </div>
      {treatments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {treatments.slice(0, 4).map((t) => <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{label(t, ml)}</span>)}
          {treatments.length > 4 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{treatments.length - 4}</span>}
        </div>
      )}
      {f.ivf_success_rate_percent != null && (
        <p className="mt-2 text-xs text-gray-600">
          {ml ? 'IVF വിജയ നിരക്ക്' : 'IVF success rate'}: <span className="font-semibold text-gray-900">{f.ivf_success_rate_percent}%</span>
          <span className="text-gray-400"> · {ml ? 'സ്വയം റിപ്പോർട്ട് ചെയ്തത്' : 'self-reported'}</span>
        </p>
      )}
    </a>
  );
}
