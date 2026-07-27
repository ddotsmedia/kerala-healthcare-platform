// Health camps & community events — filterable list (type, district, when, free).

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listEvents, EVENT_TYPES } from '@/lib/events';
import { listDistricts } from '@/lib/providers';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState, Pagination } from '@khp/ui';
import EventCard from '@/components/events/EventCard';

export const dynamic = 'force-dynamic';
const LIMIT = 12;

const TYPE_LABEL = {
  screening_camp: ['സ്ക്രീനിംഗ്', 'Screening'], blood_donation: ['രക്തദാനം', 'Blood'],
  vaccination: ['വാക്സിനേഷൻ', 'Vaccination'], awareness: ['അവബോധം', 'Awareness'],
  cme: ['CME', 'CME'], wellness: ['വെൽനെസ്', 'Wellness']
};
const WHEN = [['', 'എല്ലാം', 'Any time'], ['week', 'ഈ ആഴ്ച', 'This week'], ['month', 'ഈ മാസം', 'This month']];
const FREE = [['', 'എല്ലാം', 'All'], ['1', 'സൗജന്യം', 'Free'], ['0', 'പണം', 'Paid']];

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ആരോഗ്യ ക്യാമ്പുകൾ & പരിപാടികൾ | MalayaliDoctor' : 'Health Camps & Events | MalayaliDoctor',
    description: ml
      ? 'കേരളത്തിലെ സൗജന്യ ആരോഗ്യ ക്യാമ്പുകൾ, രക്തദാന ക്യാമ്പുകൾ, വാക്സിനേഷൻ പരിപാടികൾ.'
      : 'Free health screening camps, blood donation drives and vaccination events across Kerala.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function EventsFeed(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const cur = { type: sp.type || '', district: sp.district || '', when: sp.when || '', free: sp.free || '' };

  const [events, districts] = await Promise.all([
    listEvents({ type: cur.type, districtId: cur.district, when: cur.when, free: cur.free, page, limit: LIMIT }),
    listDistricts()
  ]);
  const base = `/${locale}/events`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold">{ml ? 'ആരോഗ്യ ക്യാമ്പുകൾ & പരിപാടികൾ' : 'Health Camps & Events'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'നിങ്ങൾക്ക് അടുത്തുള്ള സൗജന്യ ആരോഗ്യ പരിപാടികൾ കണ്ടെത്തൂ' : 'Find free health events happening near you'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-8">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Type */}
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'തരം' : 'Type'}>
            <Link href={qs(base, { ...cur, type: '', page: '' })} className={chip(!cur.type)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {EVENT_TYPES.map((t) => (
              <Link key={t} href={qs(base, { ...cur, type: t, page: '' })} className={chip(cur.type === t)}>
                {ml ? TYPE_LABEL[t][0] : TYPE_LABEL[t][1]}
              </Link>
            ))}
          </nav>
          {/* When + Free + District */}
          <div className="flex flex-wrap gap-2">
            {WHEN.map(([v, mlL, enL]) => (
              <Link key={v || 'any'} href={qs(base, { ...cur, when: v, page: '' })} className={chip(cur.when === v)}>{ml ? mlL : enL}</Link>
            ))}
            <span className="mx-1 self-center text-gray-300">|</span>
            {FREE.map(([v, mlL, enL]) => (
              <Link key={v || 'allfree'} href={qs(base, { ...cur, free: v, page: '' })} className={chip(cur.free === v)}>{ml ? mlL : enL}</Link>
            ))}
          </div>
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'ജില്ല' : 'District'}>
            <Link href={qs(base, { ...cur, district: '', page: '' })} className={chip(!cur.district)}>{ml ? 'എല്ലാ ജില്ലകളും' : 'All districts'}</Link>
            {districts.map((d) => (
              <Link key={d.id} href={qs(base, { ...cur, district: d.id, page: '' })} className={chip(cur.district === d.id)}>
                {(ml ? d.name_ml : d.name_en) || d.name_en}
              </Link>
            ))}
          </nav>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl">
          {events.length === 0 ? (
            <EmptyState title={ml ? 'പരിപാടികളൊന്നും കണ്ടെത്തിയില്ല' : 'No events found'} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {events.map((e) => <EventCard key={e.id} event={e} locale={locale} />)}
            </div>
          )}
          <div className="mt-6">
            <Pagination basePath={base} query={cur} page={page}
              hasNext={events.length === LIMIT} locale={locale} />
          </div>
        </div>
      </FullBleed>
    </div>
  );
}
