// Child Health Centre.

import { resolveLocale } from '@/lib/i18n';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { TrustSection, FAQ } from '@/components/trust/TrustParts';
import { HubHero, HelplineBand, Disclaimer } from '@/components/hubs/HubParts';
import GrowthTracker from '@/components/hubs/GrowthTracker';
import PrintButton from '@/components/hubs/PrintButton';
import { DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'ശിശു ആരോഗ്യം | MalayaliDoctor' : 'Child Health | MalayaliDoctor' };
}

const VACCINES = [
  ['Birth', 'BCG, OPV-0, Hep B-1', 'TB, polio, hepatitis B'],
  ['6 weeks', 'DTwP-1, OPV-1, Hep B-2, Hib-1, IPV-1, RVV-1, PCV-1', 'Diphtheria, tetanus, pertussis, polio, Hib, rotavirus, pneumococcus'],
  ['10 weeks', 'DTwP-2, OPV-2, Hib-2, IPV-2, RVV-2, PCV-2', 'Booster doses'],
  ['14 weeks', 'DTwP-3, OPV-3, Hib-3, IPV-3, RVV-3, PCV-3', 'Booster doses'],
  ['9 months', 'Measles / MR-1, Vitamin A-1', 'Measles, rubella, vitamin A'],
  ['16-24 months', 'DTwP booster, OPV booster, MR-2', 'Boosters'],
  ['5-6 years', 'DTwP booster-2', 'Booster']
];

export default async function ChildHealth(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const ped = await getSpecialtyBySlug('pediatrics');
  const doctors = ped ? await searchDoctors({ specialtyId: ped.id, page: 1, limit: 4 }) : [];

  const ages = [
    { q: ml ? '👶 0-12 മാസം' : '👶 0-12 months', a: ml ? 'നവജാത പരിചരണം, മുലയൂട്ടൽ, ഉറക്കം, വളർച്ചാ നാഴികക്കല്ലുകൾ. പനി അല്ലെങ്കിൽ ഭക്ഷണം കുറയുന്നുവെങ്കിൽ ഡോക്ടറെ കാണുക.' : 'Newborn care, feeding, sleep, developmental milestones. See a doctor for fever or poor feeding.' },
    { q: ml ? '🧒 1-3 വയസ്സ്' : '🧒 1-3 years', a: ml ? 'ടോഡ്ലർ ആരോഗ്യം, പോഷകാഹാരം, സംസാര വികാസം, സാധാരണ അസുഖങ്ങൾ.' : 'Toddler health, nutrition, speech development, common illnesses.' },
    { q: ml ? '👦 3-6 വയസ്സ്' : '👦 3-6 years', a: ml ? 'പ്രീസ്കൂൾ ആരോഗ്യം, ദന്ത പരിചരണം, കാഴ്ച പരിശോധന, വാക്സിനുകൾ.' : 'Preschool health, dental care, vision check, vaccines.' },
    { q: ml ? '🧑 6-12 വയസ്സ്' : '🧑 6-12 years', a: ml ? 'സ്കൂൾ ആരോഗ്യം, പോഷകാഹാരം, മാനസിക ക്ഷേമം, കായിക പരിക്കുകൾ.' : 'School health, nutrition, mental wellbeing, sports injuries.' }
  ];
  const illnesses = [
    { q: ml ? 'പനി' : 'Fever', a: ml ? 'വിശ്രമം, ജലാംശം. 3 മാസത്തിൽ താഴെ കുഞ്ഞിന് പനി വന്നാൽ ഉടൻ ER.' : 'Rest, fluids. Rush to ER if a baby under 3 months has fever.' },
    { q: ml ? 'ജലദോഷം' : 'Cold', a: ml ? 'ജലാംശം, വിശ്രമം. ശ്വാസതടസ്സമുണ്ടെങ്കിൽ ഡോക്ടറെ കാണുക.' : 'Fluids, rest. See a doctor if breathing is difficult.' },
    { q: ml ? 'വയറിളക്കം' : 'Diarrhea', a: ml ? 'ORS നൽകുക. മൂത്രം കുറയൽ/ക്ഷീണം → ER.' : 'Give ORS. Reduced urine/lethargy → ER.' },
    { q: ml ? 'ഡെങ്കി മുന്നറിയിപ്പ്' : 'Dengue warning', a: ml ? 'നിരന്തര ഛർദ്ദി, വയറുവേദന, രക്തസ്രാവം → ഉടൻ ER.' : 'Persistent vomiting, abdominal pain, bleeding → ER immediately.' }
  ];

  return (
    <div className="-my-6">
      <HubHero title={ml ? 'നിങ്ങളുടെ കുഞ്ഞിന്റെ ആരോഗ്യം' : "Your Child's Health"} gradient="from-amber-400 to-orange-500" />
      <HelplineBand tone="brand" lines={[{ label: 'CHILDLINE', number: '1098' }]} title={ml ? 'ശിശു ഹെൽപ്‌ലൈൻ (24/7):' : 'Child helpline (24/7):'} />

      <TrustSection title={ml ? 'പ്രായം അനുസരിച്ച്' : 'By age'}>
        <FAQ items={ages} />
      </TrustSection>

      <TrustSection title={ml ? 'വാക്സിനേഷൻ ഷെഡ്യൂൾ (Kerala NIS)' : 'Vaccination Schedule (Kerala NIS)'} tint="gray">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex justify-end"><PrintButton label={ml ? 'ഷെഡ്യൂൾ പ്രിന്റ്' : 'Print schedule'} /></div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="px-3 py-2">{ml ? 'പ്രായം' : 'Age'}</th><th className="px-3 py-2">{ml ? 'വാക്സിൻ' : 'Vaccine'}</th><th className="px-3 py-2">{ml ? 'ഉദ്ദേശ്യം' : 'Purpose'}</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {VACCINES.map((v, i) => (
                  <tr key={i}><td className="px-3 py-2 font-medium text-gray-900">{v[0]}</td><td className="px-3 py-2">{v[1]}</td><td className="px-3 py-2 text-gray-600">{v[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-amber-900">{ml ? 'നിങ്ങളുടെ കുഞ്ഞിന്റെ പ്രത്യേക ആവശ്യങ്ങൾക്ക് ശിശുരോഗ വിദഗ്ധനെ സമീപിക്കുക.' : "Consult your pediatrician for your child's specific vaccination needs."}</p>
        </div>
      </TrustSection>

      <TrustSection title={ml ? 'വളർച്ചാ ട്രാക്കർ' : 'Growth Tracker'}>
        <GrowthTracker params={props.params} />
      </TrustSection>

      <TrustSection title={ml ? 'സാധാരണ ബാല്യകാല രോഗങ്ങൾ' : 'Common childhood illnesses'} tint="gray">
        <FAQ items={illnesses} />
      </TrustSection>

      {doctors.length > 0 && (
        <TrustSection title={ml ? 'ശിശുരോഗ വിദഗ്ധർ' : 'Pediatricians'}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
        </TrustSection>
      )}

      <TrustSection>
        <Disclaimer>{ml ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രം. ശിശുരോഗ വിദഗ്ധനെ സമീപിക്കുക.' : 'This information is for education only. Consult a pediatrician.'}</Disclaimer>
      </TrustSection>
    </div>
  );
}
