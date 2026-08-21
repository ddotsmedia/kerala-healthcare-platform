// Kerala Health Trends — public health intelligence from anonymous search data.
// General awareness only; not a diagnosis. Non-dismissable disclaimer shown.

import { resolveLocale } from '@/lib/i18n';
import { SITE } from '@/lib/schema';
import { topConditions, districtSearches, SEASONS, currentSeasonKey } from '@/lib/healthTrends';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  const title = ml ? 'കേരള ആരോഗ്യ ട്രെൻഡുകൾ | MalayaliDoctor' : 'Kerala Health Trends | MalayaliDoctor';
  const description = ml
    ? 'അജ്ഞാത തിരയൽ ഡാറ്റ അടിസ്ഥാനമാക്കി കേരളത്തിലെ ആരോഗ്യ തിരയൽ ട്രെൻഡുകൾ.'
    : 'Health search trends across Kerala based on anonymous search data.';
  return { title, description, alternates: { canonical: `${SITE}/${resolveLocale(locale)}/health-trends` } };
}

export default async function HealthTrendsPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const [conditions, districts] = await Promise.all([topConditions(30, 15), districtSearches(30)]);
  const seasonKey = currentSeasonKey(new Date().getMonth());
  const maxC = Math.max(1, ...conditions.map((c) => c.searches));
  const maxD = Math.max(1, ...districts.map((d) => d.searches));

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{ml ? 'കേരള ആരോഗ്യ ട്രെൻഡുകൾ' : 'Kerala Health Trends'}</h1>
        <p className="mt-1 text-sm text-gray-500">{ml ? 'അജ്ഞാത തിരയൽ ഡാറ്റ അടിസ്ഥാനമാക്കി · കഴിഞ്ഞ 30 ദിവസം' : 'Based on anonymous search data · last 30 days'}</p>
      </header>

      <KnowledgeDisclaimer locale={locale} />

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഈ മാസം ഏറ്റവും കൂടുതൽ തിരഞ്ഞ ആരോഗ്യ വിഷയങ്ങൾ' : 'Most-searched health topics this month'}</h2>
        {conditions.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">{ml ? 'ഇതുവരെ മതിയായ ഡാറ്റ ഇല്ല.' : 'Not enough data yet — check back soon.'}</p>
        ) : (
          <ol className="space-y-2">
            {conditions.map((c, i) => (
              <li key={c.query} className="flex items-center gap-3">
                <span className="w-5 text-right text-sm font-bold text-gray-400">{i + 1}</span>
                <span className="w-40 shrink-0 truncate text-sm font-medium capitalize text-gray-800">{c.query}</span>
                <div className="h-3 flex-1 rounded-full bg-gray-100"><div className="h-3 rounded-full bg-brand" style={{ width: `${Math.round((c.searches / maxC) * 100)}%` }} /></div>
                <span className="w-10 text-right text-xs text-gray-500">{c.searches}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ജില്ല തിരിച്ചുള്ള തിരയൽ പ്രവർത്തനം' : 'District-wise search activity'}</h2>
        {districts.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">{ml ? 'ജില്ല തിരയൽ ഡാറ്റ ഇതുവരെ ഇല്ല.' : 'No district search data yet.'}</p>
        ) : (
          <div className="space-y-2">
            {districts.map((d) => (
              <div key={d.name_en} className="flex items-center gap-2">
                <span className="w-32 shrink-0 truncate text-sm text-gray-700">{ml ? (d.name_ml || d.name_en) : d.name_en}</span>
                <div className="h-4 flex-1 rounded bg-gray-100"><div className="h-4 rounded bg-teal-500" style={{ width: `${Math.round((d.searches / maxD) * 100)}%` }} /></div>
                <span className="w-10 text-right text-xs font-semibold text-gray-600">{d.searches}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സീസണൽ ആരോഗ്യ പാറ്റേണുകൾ' : 'Seasonal health patterns'}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SEASONS.map((s) => {
            const active = s.key === seasonKey;
            return (
              <div key={s.key} className={`rounded-xl border p-4 ${active ? 'border-brand bg-teal-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-sm font-bold text-gray-900">{ml ? s.label_ml : s.label_en}{active ? <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">{ml ? 'ഇപ്പോൾ' : 'Now'}</span> : null}</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {(ml ? s.conditions_ml : s.conditions_en).map((c) => <li key={c}>• {c}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400">{ml ? 'ഇത് പൊതു ബോധവൽക്കരണത്തിനുള്ളതാണ്, രോഗനിർണയമല്ല. രോഗലക്ഷണങ്ങൾക്ക് ഒരു ഡോക്ടറെ സമീപിക്കുക.' : 'For general awareness only — not a diagnosis. Consult a doctor for any symptoms.'}</p>
      </section>
    </main>
  );
}
