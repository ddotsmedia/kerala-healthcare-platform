// Clinical Guidelines Simplified — patient-friendly summaries citing ICMR/WHO etc.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listGuidelines } from '@/lib/guidelines';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ലളിതമാക്കിയ ക്ലിനിക്കൽ മാർഗരേഖകൾ | MalayaliDoctor' : 'Clinical Guidelines Simplified | MalayaliDoctor',
    description: ml
      ? 'ICMR/WHO മാർഗരേഖകളുടെ രോഗീ-സൗഹൃദ ലളിത സംഗ്രഹങ്ങൾ — പ്രമേഹം, രക്തസമ്മർദ്ദം, ക്ഷയം തുടങ്ങിയവ.'
      : 'Patient-friendly simplified summaries of ICMR/WHO clinical guidelines.'
  };
}

export default async function GuidelinesIndex(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const items = await listGuidelines();

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">📋 {ml ? 'ലളിതമാക്കിയ മാർഗരേഖകൾ' : 'Clinical Guidelines Simplified'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'ഔദ്യോഗിക മാർഗരേഖകളുടെ രോഗീ-സൗഹൃദ പതിപ്പുകൾ' : 'Patient-friendly versions of official guidelines'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          {items.length === 0 ? (
            <EmptyState title={ml ? 'ഒന്നും കണ്ടെത്തിയില്ല' : 'Nothing found'} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((g) => (
                <Link key={g.id} href={`/${locale}/guidelines/${g.slug}`} className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand">
                  <div className="text-2xl">📋</div>
                  <h2 className="mt-1 text-base font-bold text-gray-900">{(ml ? g.title_ml : g.title_en) || g.title_en}</h2>
                  {(g.excerpt_ml || g.excerpt_en) && <p className="mt-1 text-sm text-gray-600">{(ml ? g.excerpt_ml : g.excerpt_en) || g.excerpt_en}</p>}
                  {g.source_org && <p className="mt-2 text-xs font-semibold text-brand">{ml ? 'സ്രോതസ്സ്: ' : 'Source: '}{g.source_org}</p>}
                </Link>
              ))}
            </div>
          )}
          <div role="note" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഇത് ഒരു ലളിതമാക്കിയ സംഗ്രഹമാണ്. ക്ലിനിക്കൽ ഉപയോഗത്തിന് യഥാർത്ഥ മാർഗരേഖ പരിശോധിക്കുക.'
              : 'This is a simplified summary. Refer to the original guideline for clinical use.'}
          </div>
        </div>
      </FullBleed>
    </div>
  );
}
