// Hospital OPD schedule — day-wise view of all doctors' OPD timings here.
// Today's OPD highlighted at the top. SSR.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getHospitalBySlug } from '@/lib/providers';
import { hospitalOpd } from '@/lib/opd';
import { SITE } from '@/lib/schema';

export const dynamic = 'force-dynamic';

const DAYS = [
  { ml: 'ഞായർ', en: 'Sunday' }, { ml: 'തിങ്കൾ', en: 'Monday' }, { ml: 'ചൊവ്വ', en: 'Tuesday' },
  { ml: 'ബുധൻ', en: 'Wednesday' }, { ml: 'വ്യാഴം', en: 'Thursday' }, { ml: 'വെള്ളി', en: 'Friday' }, { ml: 'ശനി', en: 'Saturday' }
];
const CTYPE = { outpatient: { ml: 'ഒപി', en: 'Outpatient' }, ward_rounds: { ml: 'വാർഡ് റൗണ്ട്സ്', en: 'Ward rounds' }, surgery_day: { ml: 'സർജറി', en: 'Surgery day' } };
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');

function todayIndexIST() {
  try {
    const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(new Date());
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
  } catch { return new Date().getDay(); }
}

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const h = await getHospitalBySlug(params.slug);
  if (!h) return { title: locale === 'ml' ? 'OPD' : 'OPD Schedule' };
  const name = h.name_en || h.name_ml;
  return {
    title: `OPD Schedule — ${name} | MalayaliDoctor`.slice(0, 65),
    description: `Doctor OPD timings at ${name}, ${h.district_en || 'Kerala'}. Day-wise consultation schedule.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/hospitals/${h.slug}/opd` }
  };
}

function OpdRow({ o, locale }) {
  const ml = locale === 'ml';
  const ct = CTYPE[o.consultation_type];
  const specialty = ml ? o.specialty_ml : o.specialty_en;
  const notes = ml ? o.notes_ml : o.notes_en;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 py-2 last:border-0">
      <div className="min-w-0">
        <Link href={`/${locale}/doctors/${o.doctor_slug}`} className="font-medium text-gray-900 hover:text-brand">{o.doctor_name}</Link>
        {specialty && <span className="ml-2 text-xs text-gray-500">{specialty}</span>}
        {notes && <p className="text-xs text-gray-400">{notes}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="font-medium">{fmtTime(o.start_time)}–{fmtTime(o.end_time)}</span>
        {ct && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{ct[locale] || ct.en}</span>}
        {o.max_tokens != null && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-brand">{o.max_tokens} {ml ? 'ടോക്കൺ' : 'tokens'}</span>}
      </div>
    </div>
  );
}

export default async function HospitalOpdPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const h = await getHospitalBySlug(params.slug);
  if (!h) notFound();

  const schedules = await hospitalOpd(h.id);
  const name = (ml ? h.name_ml : h.name_en) || h.name_en;
  const byDay = DAYS.map((_, i) => schedules.filter((o) => Array.isArray(o.day_of_week) && o.day_of_week.includes(i)));
  const today = todayIndexIST();

  return (
    <div className="space-y-5">
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/hospitals`} className="hover:text-brand">{ml ? 'ആശുപത്രികൾ' : 'Hospitals'}</Link> ›{' '}
        <Link href={`/${locale}/hospitals/${h.slug}`} className="hover:text-brand">{name}</Link> › <span className="text-gray-700">OPD</span>
      </nav>

      <h1 className="text-xl font-bold">🗓️ {ml ? `${name} — OPD സമയം` : `${name} — OPD Schedule`}</h1>

      {schedules.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">{ml ? 'OPD സമയവിവരം ലഭ്യമല്ല. നേരിട്ട് ആശുപത്രിയിൽ വിളിക്കുക.' : 'OPD timings not listed yet. Please call the hospital directly.'}</p>
      ) : (
        <>
          {/* Today's OPD */}
          <section className="rounded-xl border-2 border-brand bg-teal-50/50 p-4">
            <h2 className="mb-2 text-sm font-bold text-brand">⭐ {ml ? `ഇന്നത്തെ OPD (${DAYS[today].ml})` : `Today's OPD (${DAYS[today].en})`}</h2>
            {byDay[today].length === 0 ? <p className="text-sm text-gray-500">{ml ? 'ഇന്ന് OPD ഇല്ല.' : 'No OPD scheduled today.'}</p>
              : byDay[today].map((o) => <OpdRow key={o.id} o={o} locale={locale} />)}
          </section>

          {/* Full week */}
          <div className="space-y-3">
            {DAYS.map((d, i) => (
              <section key={i} className={`rounded-xl border p-4 ${i === today ? 'border-brand/40' : 'border-gray-200'} bg-white`}>
                <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? d.ml : d.en}{i === today && <span className="ml-2 text-xs text-brand">({ml ? 'ഇന്ന്' : 'Today'})</span>}</h2>
                {byDay[i].length === 0 ? <p className="text-sm text-gray-400">{ml ? '—' : 'No OPD'}</p>
                  : byDay[i].map((o) => <OpdRow key={`${i}-${o.id}`} o={o} locale={locale} />)}
              </section>
            ))}
          </div>
        </>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'OPD സമയം മാറാവുന്നതാണ് — യാത്രയ്ക്ക് മുമ്പ് ആശുപത്രിയിൽ വിളിച്ച് സ്ഥിരീകരിക്കുക.' : 'OPD timings may change — please call the hospital to confirm before travelling.'}
      </div>
    </div>
  );
}
