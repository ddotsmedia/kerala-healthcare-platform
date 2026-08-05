// Lab Test Guide — search, category tabs, test cards. Educational only.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listLabTests, LAB_CATEGORIES } from '@/lib/labTests';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState, Pagination } from '@khp/ui';
import LabTestCard from '@/components/labtests/LabTestCard';
import LabTestSearch from '@/components/labtests/LabTestSearch';

export const dynamic = 'force-dynamic';
const LIMIT = 24;

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ലാബ് ടെസ്റ്റ് ഗൈഡ് — കേരള ഹെൽത്ത് | MalayaliDoctor' : 'Lab Test Guide — Kerala Health | MalayaliDoctor',
    description: ml
      ? 'ലാബ് ടെസ്റ്റുകൾ വിശദീകരിക്കുന്നു — എന്ത് അളക്കുന്നു, തയ്യാറെടുപ്പ്, സാധാരണ പരിധികൾ. വിദ്യാഭ്യാസത്തിന് മാത്രം.'
      : 'Common lab tests explained — what they measure, preparation and normal ranges. Educational only.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function LabTestsIndex(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const cur = { q: sp.q || '', category: sp.category || '' };

  const tests = await listLabTests({ q: cur.q, category: cur.category, page, limit: LIMIT });
  const base = `/${locale}/lab-tests`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🧪 {ml ? 'ലാബ് ടെസ്റ്റ് ഗൈഡ്' : 'Lab Test Guide'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'ടെസ്റ്റുകൾ എന്ത് അളക്കുന്നു, തയ്യാറെടുപ്പ്, സാധാരണ പരിധികൾ' : 'What tests measure, how to prepare, and normal ranges'}</p>
          <div className="mt-4"><LabTestSearch locale={locale} initialQuery={cur.q} /></div>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-5xl px-4">
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={qs(base, { q: cur.q })} className={chip(!cur.category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {LAB_CATEGORIES.map((c) => (
              <Link key={c.key} href={qs(base, { category: c.key })} className={chip(cur.category === c.key)}>
                {ml ? c.ml : c.en}
              </Link>
            ))}
          </nav>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {tests.length === 0 ? (
            <EmptyState title={ml ? 'ടെസ്റ്റുകളൊന്നും കണ്ടെത്തിയില്ല' : 'No tests found'} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((t) => <LabTestCard key={t.id} test={t} locale={locale} />)}
            </div>
          )}
          <div className="mt-6">
            <Pagination basePath={base} query={cur} page={page} hasNext={tests.length === LIMIT} locale={locale} />
          </div>

          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രം. അസാധാരണമായ ഫലങ്ങൾ ഒരു രോഗമുണ്ടെന്ന് അർത്ഥമാക്കുന്നില്ല — എപ്പോഴും ഫലങ്ങൾ ഡോക്ടറുമായി ചർച്ച ചെയ്യുക.'
              : 'This information is for education only. Abnormal results do not mean you have a disease — always discuss your results with your doctor.'}
          </p>
        </div>
      </FullBleed>
    </div>
  );
}
