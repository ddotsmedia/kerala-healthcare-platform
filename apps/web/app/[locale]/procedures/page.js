// Medical Procedure Library — browse by specialty, anaesthesia, hospital stay.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listProcedures, PROC_CATEGORIES, ANAESTHESIA } from '@/lib/procedures';
import { listSpecialties } from '@/lib/providers';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState, Pagination } from '@khp/ui';
import ProcedureCard from '@/components/procedures/ProcedureCard';

export const dynamic = 'force-dynamic';
const LIMIT = 24;

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'മെഡിക്കൽ നടപടിക്രമങ്ങൾ | MalayaliDoctor' : 'Medical Procedure Library | MalayaliDoctor',
    description: ml
      ? 'മെഡിക്കൽ നടപടിക്രമങ്ങൾ വിശദീകരിക്കുന്നു — എന്ത് പ്രതീക്ഷിക്കാം, തയ്യാറെടുപ്പ്, സുഖം പ്രാപിക്കൽ. വിദ്യാഭ്യാസത്തിന് മാത്രം.'
      : 'Common medical procedures explained — what to expect, preparation and recovery. Educational only.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function ProceduresIndex(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const cur = { category: sp.category || '', specialty: sp.specialty || '', anaesthesia: sp.anaesthesia || '', stay: sp.stay || '' };

  const [procedures, specialties] = await Promise.all([
    listProcedures({ category: cur.category, specialtyId: cur.specialty, anaesthesia: cur.anaesthesia, stay: cur.stay, page, limit: LIMIT }),
    listSpecialties()
  ]);
  const base = `/${locale}/procedures`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🩺 {ml ? 'മെഡിക്കൽ നടപടിക്രമങ്ങൾ' : 'Medical Procedure Library'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'എന്ത് പ്രതീക്ഷിക്കാം · തയ്യാറെടുപ്പ് · സുഖം പ്രാപിക്കൽ' : 'What to expect · preparation · recovery'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-5xl space-y-3 px-4">
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={qs(base, { ...cur, category: '' })} className={chip(!cur.category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {PROC_CATEGORIES.map((c) => (
              <Link key={c.key} href={qs(base, { ...cur, category: c.key })} className={chip(cur.category === c.key)}>{ml ? c.ml : c.en}</Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-2">
            {ANAESTHESIA.map((a) => (
              <Link key={a.key} href={qs(base, { ...cur, anaesthesia: cur.anaesthesia === a.key ? '' : a.key })} className={chip(cur.anaesthesia === a.key)}>
                💉 {ml ? a.ml : a.en}
              </Link>
            ))}
            <span className="mx-1 self-center text-gray-300">|</span>
            <Link href={qs(base, { ...cur, stay: cur.stay === 'no' ? '' : 'no' })} className={chip(cur.stay === 'no')}>{ml ? 'ഡേ-കെയർ' : 'Day-care'}</Link>
            <Link href={qs(base, { ...cur, stay: cur.stay === 'yes' ? '' : 'yes' })} className={chip(cur.stay === 'yes')}>{ml ? 'ആശുപത്രിവാസം' : 'Hospital stay'}</Link>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'സ്പെഷ്യാലിറ്റി' : 'Specialty'}>
            <Link href={qs(base, { ...cur, specialty: '' })} className={chip(!cur.specialty)}>{ml ? 'എല്ലാ സ്പെഷ്യാലിറ്റികളും' : 'All specialties'}</Link>
            {specialties.map((s) => (
              <Link key={s.id} href={qs(base, { ...cur, specialty: s.id })} className={chip(cur.specialty === s.id)}>
                {(ml ? s.name_ml : s.name_en) || s.name_en}
              </Link>
            ))}
          </nav>
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {procedures.length === 0 ? (
            <EmptyState title={ml ? 'നടപടിക്രമങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No procedures found'} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {procedures.map((p) => <ProcedureCard key={p.id} procedure={p} locale={locale} />)}
            </div>
          )}
          <div className="mt-6">
            <Pagination basePath={base} query={cur} page={page} hasNext={procedures.length === LIMIT} locale={locale} />
          </div>
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            {ml
              ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രം — ചികിത്സാ ഉപദേശമല്ല. നിങ്ങളുടെ നടപടിക്രമത്തെക്കുറിച്ച് ഡോക്ടറുമായി സംസാരിക്കുക.'
              : 'This information is for education only — not medical advice. Discuss your specific procedure with your doctor.'}
          </p>
        </div>
      </FullBleed>
    </div>
  );
}
