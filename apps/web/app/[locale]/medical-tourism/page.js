// Kerala Medical Tourism — international patient landing. Static content +
// existing hospital data. Costs are approximate/illustrative, clearly labelled.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchHospitals } from '@/lib/providers';
import { HospitalCard } from '@khp/ui';
import { FullBleed } from '@/components/home/HomeSections';
import { WhyGrid, TreatmentGrid, CostTable, MEDICAL_VISA_URL } from '@/components/tourism/MedicalTourismParts';

export const dynamic = 'force-dynamic';

const FEATURED_LIMIT = 4;

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'കേരള മെഡിക്കൽ ടൂറിസം | MalayaliDoctor' : 'Kerala Medical Tourism | MalayaliDoctor',
    description: ml
      ? 'അന്താരാഷ്ട്ര രോഗികൾക്കായി കേരളത്തിലെ ഗുണനിലവാരമുള്ള ചികിത്സ — ആശുപത്രികൾ, ചെലവ് താരതമ്യം, മെഡിക്കൽ വിസ വിവരങ്ങൾ.'
      : 'Quality care in Kerala for international patients — hospitals, cost comparison and medical-visa information on MalayaliDoctor.'
  };
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function MedicalTourismPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const hospitals = await searchHospitals({ page: 1, limit: FEATURED_LIMIT });

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">🌏 {ml ? 'കേരള മെഡിക്കൽ ടൂറിസം' : 'Kerala Medical Tourism'}</h1>
          <p className="mt-2 text-sm text-white/90">
            {ml
              ? 'ലോകനിലവാരമുള്ള ചികിത്സ · താങ്ങാവുന്ന ചെലവ് · "ദൈവത്തിന്റെ സ്വന്തം നാട്ടിൽ" സൗഖ്യം'
              : 'World-class treatment · Affordable cost · Healing in God’s Own Country'}
          </p>
          <Link href={`/${locale}/contact`}
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-gray-100">
            {ml ? 'പാക്കേജുകൾക്ക് ബന്ധപ്പെടുക' : 'Contact us for packages'}
          </Link>
        </div>
      </FullBleed>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <Section title={ml ? 'എന്തുകൊണ്ട് കേരളം?' : 'Why Kerala?'}>
          <WhyGrid locale={locale} />
        </Section>

        <Section title={ml ? 'ജനപ്രിയ ചികിത്സകൾ' : 'Popular treatments'}>
          <TreatmentGrid locale={locale} />
        </Section>

        <Section title={ml ? 'അന്താരാഷ്ട്ര രോഗികൾക്കുള്ള ആശുപത്രികൾ' : 'Featured hospitals for international patients'}>
          {hospitals.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">{ml ? 'ഉടൻ ലഭ്യമാകും.' : 'Coming soon.'}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hospitals.map((h) => <HospitalCard key={h.id} hospital={h} locale={locale} />)}
            </div>
          )}
          <Link href={`/${locale}/hospitals`} className="inline-block text-sm font-semibold text-brand hover:underline">
            {ml ? 'എല്ലാ ആശുപത്രികളും കാണൂ →' : 'See all hospitals →'}
          </Link>
        </Section>

        <Section title={ml ? 'ചെലവ് താരതമ്യം (ഏകദേശം)' : 'Cost comparison (approximate)'}>
          <CostTable locale={locale} />
          <p className="text-xs text-gray-500">
            {ml
              ? 'മുകളിലുള്ള കണക്കുകൾ ഏകദേശ സൂചക ശ്രേണികൾ (USD) മാത്രമാണ് — ഒരു ക്വട്ടേഷനല്ല. യഥാർത്ഥ ചെലവ് ആശുപത്രിയും രോഗാവസ്ഥയും അനുസരിച്ച് വ്യത്യാസപ്പെടും.'
              : 'Figures above are approximate indicative ranges (USD), not a quotation. Actual cost varies by hospital and individual condition.'}
          </p>
        </Section>

        <Section title={ml ? 'മെഡിക്കൽ വിസ വിവരങ്ങൾ' : 'Visa information'}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-700">
              {ml
                ? 'ഇന്ത്യയിലേക്ക് ചികിത്സയ്ക്കായി വരുന്നവർക്ക് മെഡിക്കൽ വിസ (അല്ലെങ്കിൽ e-Medical Visa) ലഭ്യമാണ്. ആശുപത്രിയിൽ നിന്നുള്ള കത്ത് സാധാരണയായി ആവശ്യമാണ്. ഔദ്യോഗിക അപേക്ഷയ്ക്ക് ഇന്ത്യൻ വിസ പോർട്ടൽ സന്ദർശിക്കുക.'
                : 'International patients can apply for a Medical Visa (or e-Medical Visa) to India. A letter from the treating hospital is usually required. Apply through the official Indian visa portal.'}
            </p>
            <a href={MEDICAL_VISA_URL} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              {ml ? 'ഔദ്യോഗിക ഇന്ത്യൻ വിസ സൈറ്റ് →' : 'Official Indian visa site →'}
            </a>
          </div>
        </Section>

        <Section title={ml ? 'താമസ സൗകര്യം' : 'Accommodation'}>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
            <p className="text-sm font-medium text-gray-600">🏨 {ml ? 'പങ്കാളി ഹോട്ടലുകൾ ഉടൻ വരുന്നു' : 'Partner hotels coming soon'}</p>
            <p className="mt-1 text-xs text-gray-500">
              {ml ? 'ആശുപത്രിക്ക് സമീപമുള്ള താമസ സൗകര്യങ്ങൾക്കായി ഞങ്ങളെ ബന്ധപ്പെടുക.' : 'Contact us for help with stays near your hospital.'}
            </p>
          </div>
        </Section>

        <div className="rounded-2xl bg-brand p-6 text-center text-white">
          <h2 className="text-lg font-bold">{ml ? 'നിങ്ങളുടെ ചികിത്സാ യാത്ര ആസൂത്രണം ചെയ്യാൻ സഹായിക്കാം' : 'Let us help plan your treatment journey'}</h2>
          <Link href={`/${locale}/contact`}
            className="mt-3 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-gray-100">
            {ml ? 'ബന്ധപ്പെടുക' : 'Contact us'}
          </Link>
        </div>

        <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          {ml
            ? 'ഈ പേജ് പൊതുവിവരങ്ങൾക്ക് മാത്രം — ചികിത്സാ ഉപദേശമോ വിലനിർണയമോ അല്ല. ചികിത്സ, ചെലവ്, വിസ എന്നിവ സംബന്ധിച്ച് ബന്ധപ്പെട്ട ആശുപത്രിയുമായും ഔദ്യോഗിക അധികാരികളുമായും സ്ഥിരീകരിക്കുക.'
            : 'This page is general information only — not medical advice or a price quote. Confirm treatment, costs and visa details with the specific hospital and official authorities.'}
        </div>
      </main>
    </div>
  );
}
