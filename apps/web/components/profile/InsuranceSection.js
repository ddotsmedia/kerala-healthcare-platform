// InsuranceSection — "Insurance Accepted" list for doctor/hospital profiles.

const NET = {
  preferred: { ml: 'മുൻഗണന', en: 'Preferred', cls: 'bg-green-100 text-green-700' },
  empanelled: { ml: 'എംപാനൽഡ്', en: 'Empanelled', cls: 'bg-gray-100 text-gray-600' }
};
const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function InsuranceSection({ panels = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  if (!panels || panels.length === 0) return null;
  return (
    <ul className="space-y-2">
      {panels.map((p, i) => {
        const net = NET[p.network_type] || NET.empanelled;
        const types = Array.isArray(p.policy_types) ? p.policy_types : [];
        return (
          <li key={`${p.insurer_name}-${i}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 p-3">
            <span className="text-lg" aria-hidden="true">🛡️</span>
            <span className="font-semibold text-gray-900">{p.insurer_name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${net.cls}`}>{ml ? net.ml : net.en}</span>
            {types.includes('cashless') && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">{ml ? 'ക്യാഷ്‌ലെസ്' : 'Cashless'}</span>}
            {types.includes('reimbursement') && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">{ml ? 'റീഇംബേഴ്‌സ്‌മെന്റ്' : 'Reimbursement'}</span>}
            {p.max_cashless_limit_inr != null && <span className="text-xs text-gray-500">{ml ? 'ക്യാഷ്‌ലെസ് പരിധി' : 'Cashless up to'} {inr(p.max_cashless_limit_inr)}</span>}
          </li>
        );
      })}
      <li className="text-[11px] text-gray-400">{ml ? 'ഇൻഷുറൻസ് വിവരങ്ങൾ മാറാം — ബുക്ക് ചെയ്യുന്നതിന് മുൻപ് സ്ഥിരീകരിക്കുക.' : 'Insurance details may change — please confirm before booking.'}</li>
    </ul>
  );
}
