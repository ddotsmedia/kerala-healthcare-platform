// Monthly Research Digest — archive of plain-language research summaries
// (health_news, category='research'), grouped by month.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listNews } from '@/lib/news';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ആരോഗ്യ ഗവേഷണ ഡൈജസ്റ്റ് | MalayaliDoctor' : 'Health Research Digest | MalayaliDoctor',
    description: ml
      ? 'കേരള-ഇന്ത്യ ആരോഗ്യ ഗവേഷണത്തിന്റെ പ്രതിമാസ സംഗ്രഹം — ലളിതമായ ഭാഷയിൽ രോഗികൾക്കായി.'
      : 'A monthly summary of Kerala and India health research, in plain language for patients.'
  };
}

function monthKey(d, ml) {
  const dt = new Date(d);
  return dt.toLocaleString(ml ? 'en-IN' : 'en', { month: 'long', year: 'numeric' });
}

export default async function ResearchIndex(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const items = await listNews({ category: 'research', limit: 50 });

  // group by month
  const groups = [];
  const byMonth = {};
  for (const it of items) {
    const k = monthKey(it.published_at, ml);
    if (!byMonth[k]) { byMonth[k] = []; groups.push(k); }
    byMonth[k].push(it);
  }

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🔬 {ml ? 'ആരോഗ്യ ഗവേഷണ ഡൈജസ്റ്റ്' : 'Health Research Digest'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'കേരള-ഇന്ത്യ ആരോഗ്യ ഗവേഷണത്തിന്റെ പ്രതിമാസ സംഗ്രഹം' : 'A monthly summary of Kerala & India health research'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl space-y-6 px-4">
          {items.length === 0 ? (
            <EmptyState title={ml ? 'ഡൈജസ്റ്റുകളൊന്നും ലഭ്യമല്ല' : 'No digests yet'} />
          ) : (
            groups.map((month) => (
              <section key={month}>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">{month}</h2>
                <div className="space-y-3">
                  {byMonth[month].map((it) => (
                    <Link key={it.id} href={`/${locale}/news/${it.slug}`} className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand">
                      <h3 className="text-base font-bold text-gray-900">{(ml ? it.title_ml : it.title_en) || it.title_ml}</h3>
                      {(it.summary_ml || it.summary_en) && <p className="mt-1 text-sm text-gray-600">{(ml ? it.summary_ml : it.summary_en) || it.summary_ml}</p>}
                      <p className="mt-2 text-xs font-semibold text-brand">{ml ? 'വായിക്കൂ →' : 'Read digest →'}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
          <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഇവ പൊതു അവബോധത്തിനുള്ള ലളിതമായ സംഗ്രഹങ്ങളാണ് — വൈദ്യോപദേശമല്ല. വ്യക്തിഗത കാര്യങ്ങൾക്ക് ഡോക്ടറെ സമീപിക്കുക.'
              : 'These are simplified summaries for general awareness — not medical advice. Consult a doctor for personal matters.'}
          </div>
        </div>
      </FullBleed>
    </div>
  );
}
