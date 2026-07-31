// JobsAdLanding — conversion-focused landing for paid search
// ("[Role] Jobs in [District]"). Server component; data passed in.

import Link from 'next/link';
import { withUtm } from '@/lib/utm';

const fmtSalary = (j, ml) => {
  if (!j.salary_min && !j.salary_max) return ml ? 'ചർച്ച ചെയ്യാം' : 'Negotiable';
  const k = (n) => `₹${Math.round(n / 1000)}k`;
  if (j.salary_min && j.salary_max) return `${k(j.salary_min)}–${k(j.salary_max)}`;
  return k(j.salary_min || j.salary_max);
};

export default function JobsAdLanding({ locale, roleLabel, district, jobs, utm }) {
  const ml = locale === 'ml';
  const diName = (ml ? district.name_ml : district.name_en) || district.name_en;
  const top = jobs.slice(0, 5);
  const allHref = withUtm(`/${locale}/jobs?district=${district.id}&q=${encodeURIComponent(roleLabel)}`, utm);
  const applyHref = (slug) => withUtm(`/${locale}/jobs/${slug}`, utm);
  const alertHref = withUtm(`/${locale}/jobs/alerts`, utm);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <section className="rounded-2xl bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] p-6 text-white">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {ml ? `${diName}-ലെ ${roleLabel} ജോലികൾ` : `${roleLabel} Jobs in ${diName}`}
        </h1>
        <p className="mt-1 text-sm text-white/90">
          {ml ? 'പുതിയ ഒഴിവുകൾ · നേരിട്ട് അപേക്ഷിക്കൂ · സൗജന്യ ജോലി അലേർട്ട്' : 'Fresh openings · Apply directly · Free job alerts'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={allHref} className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-blue-800 hover:bg-gray-100">
            🔍 {ml ? 'എല്ലാ ജോലികളും' : 'See all jobs'}
          </Link>
          <Link href={alertHref} className="rounded-lg border border-white/60 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
            🔔 {ml ? 'ജോലി അലേർട്ട് സെറ്റ് ചെയ്യൂ' : 'Set job alert'}
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'നിലവിലെ ഒഴിവുകൾ' : 'Current openings'}</h2>
        {top.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            {ml ? 'ഇപ്പോൾ ഒഴിവുകളൊന്നുമില്ല — അലേർട്ട് സെറ്റ് ചെയ്യൂ.' : 'No openings right now — set an alert to be notified.'}
          </p>
        ) : (
          <div className="space-y-3">
            {top.map((j) => (
              <div key={j.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{j.title}</h3>
                    <p className="text-sm text-brand">{j.org_name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      💰 {fmtSalary(j, ml)}{j.is_remote ? ` · ${ml ? 'റിമോട്ട്' : 'Remote'}` : ''}
                    </p>
                  </div>
                  {j.is_urgent && <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">{ml ? 'അടിയന്തരം' : 'URGENT'}</span>}
                </div>
                <Link href={applyHref(j.slug)}
                  className="mt-2 block rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-dark">
                  {ml ? 'ഇപ്പോൾ അപേക്ഷിക്കൂ →' : 'Apply now →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
