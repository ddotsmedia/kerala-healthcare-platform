// Vaccination Centre.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { TrustSection, FAQ } from '@/components/trust/TrustParts';
import { HubHero, Disclaimer } from '@/components/hubs/HubParts';
import WaitlistForm from '@/components/hubs/WaitlistForm';
import Tabs from '@/components/profile/Tabs';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'വാക്സിനേഷൻ | MalayaliDoctor' : 'Vaccination | MalayaliDoctor' };
}

function Table({ rows, ml }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr><th className="px-3 py-2">{ml ? 'വാക്സിൻ' : 'Vaccine'}</th><th className="px-3 py-2">{ml ? 'തടയുന്നത്' : 'Prevents'}</th><th className="px-3 py-2">{ml ? 'പ്രായം/ഡോസ്' : 'Age / Doses'}</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => <tr key={i}><td className="px-3 py-2 font-medium text-gray-900">{r[0]}</td><td className="px-3 py-2 text-gray-600">{r[1]}</td><td className="px-3 py-2">{r[2]}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default async function Vaccination(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = resolveLocale(raw) === 'ml';

  const children = [['BCG', ml ? 'ക്ഷയം' : 'Tuberculosis', 'Birth'], ['OPV/IPV', ml ? 'പോളിയോ' : 'Polio', 'Birth–14 wk'], ['DTwP', ml ? 'ഡിഫ്തീരിയ, ടെറ്റനസ്' : 'Diphtheria, tetanus, pertussis', '6/10/14 wk'], ['MR', ml ? 'അഞ്ചാംപനി, റുബെല്ല' : 'Measles, rubella', '9 mo, 16–24 mo']];
  const pregnancy = [['Tdap', ml ? 'ടെറ്റനസ്, പെർട്ടുസിസ്' : 'Tetanus, pertussis', ml ? 'ഗർഭകാലം' : 'During pregnancy'], ['Influenza', ml ? 'ഫ്ലൂ' : 'Flu', ml ? 'ഏത് ത്രിമാസവും' : 'Any trimester']];
  const adults = [['Td/Tdap', ml ? 'ടെറ്റനസ്' : 'Tetanus', ml ? 'ഓരോ 10 വർഷം' : 'Every 10 years'], ['Hep B', ml ? 'ഹെപ്പറ്റൈറ്റിസ് B' : 'Hepatitis B', '3 doses'], ['HPV', ml ? 'സർവൈക്കൽ കാൻസർ' : 'Cervical cancer', '9–26 yrs']];
  const travel = [['Typhoid', ml ? 'ടൈഫോയ്ഡ്' : 'Typhoid', ml ? 'യാത്രയ്ക്ക് മുൻപ്' : 'Before travel'], ['Hep A', ml ? 'ഹെപ്പറ്റൈറ്റിസ് A' : 'Hepatitis A', '2 doses'], ['Yellow Fever', ml ? 'യെല്ലോ ഫീവർ' : 'Yellow fever', ml ? 'ചില രാജ്യങ്ങൾ' : 'Some countries']];
  const senior = [['Influenza', ml ? 'ഫ്ലൂ' : 'Flu', ml ? 'വർഷം തോറും' : 'Yearly'], ['PPSV23', ml ? 'ന്യുമോണിയ' : 'Pneumonia', '65+'], ['Zoster', ml ? 'ഹെർപ്പിസ് സോസ്റ്റർ' : 'Shingles', '60+']];

  const myths = [
    { q: ml ? 'മിഥ്യ: വാക്സിൻ ഓട്ടിസം ഉണ്ടാക്കുന്നു' : 'Myth: Vaccines cause autism', a: ml ? 'വസ്തുത: വിപുലമായ ശാസ്ത്രീയ ഗവേഷണത്തിലൂടെ ഈ അവകാശവാദം പൂർണ്ണമായും തള്ളിക്കളഞ്ഞു. വാക്സിനുകൾ സുരക്ഷിതവും ഫലപ്രദവുമാണ് (WHO).' : 'Fact: This claim has been thoroughly disproven by extensive research. Vaccines are safe and effective (WHO).' },
    { q: ml ? 'മിഥ്യ: പ്രകൃതിദത്ത പ്രതിരോധം മെച്ചമാണ്' : 'Myth: Natural immunity is better', a: ml ? 'വസ്തുത: രോഗം വരുന്നത് ഗുരുതര അപകടങ്ങളുണ്ടാക്കാം. വാക്സിൻ അപകടമില്ലാതെ പ്രതിരോധം നൽകുന്നു (WHO).' : 'Fact: Getting the disease can cause serious harm. Vaccines build immunity without that risk (WHO).' },
    { q: ml ? 'മിഥ്യ: വാക്സിനുകളിൽ ദോഷകരമായ വിഷവസ്തുക്കൾ' : 'Myth: Vaccines contain harmful toxins', a: ml ? 'വസ്തുത: ഘടകങ്ങൾ വളരെ ചെറിയ, സുരക്ഷിതമായ അളവിലാണ്, കർശനമായി പരീക്ഷിച്ചവയാണ് (WHO).' : 'Fact: Ingredients are in tiny, safe amounts and rigorously tested (WHO).' },
    { q: ml ? 'മിഥ്യ: ആരോഗ്യമുള്ളവർക്ക് വാക്സിൻ വേണ്ട' : "Myth: Healthy people don't need vaccines", a: ml ? 'വസ്തുത: വാക്സിനുകൾ വ്യക്തിയെയും സമൂഹത്തെയും സംരക്ഷിക്കുന്നു (herd immunity).' : 'Fact: Vaccines protect both you and the community (herd immunity).' }
  ];

  return (
    <div className="-my-6">
      <HubHero title={ml ? 'വാക്സിനേഷൻ — രോഗം തടയൂ' : 'Vaccination — Prevent Disease'} />

      <TrustSection title={ml ? 'വാക്സിൻ വിഭാഗങ്ങൾ' : 'Vaccine categories'}>
        <Tabs tabs={[
          { key: 'child', label: ml ? '👶 കുട്ടികൾ' : '👶 Children', content: <Table rows={children} ml={ml} /> },
          { key: 'preg', label: ml ? '🤰 ഗർഭകാലം' : '🤰 Pregnancy', content: <Table rows={pregnancy} ml={ml} /> },
          { key: 'adult', label: ml ? '👴 മുതിർന്നവർ' : '👴 Adults', content: <Table rows={adults} ml={ml} /> },
          { key: 'travel', label: ml ? '✈️ യാത്ര' : '✈️ Travel', content: <Table rows={travel} ml={ml} /> },
          { key: 'senior', label: ml ? '🧓 സീനിയർ' : '🧓 Senior', content: <Table rows={senior} ml={ml} /> }
        ]} />
      </TrustSection>

      <TrustSection tint="gray">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-sm text-gray-600">{ml ? 'അടുത്തുള്ള വാക്സിനേഷൻ കേന്ദ്രം കണ്ടെത്തുക' : 'Find vaccination centres near you'}</p>
          <Link href={`/${locale}/hospitals?service=vaccination`} className="inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            {ml ? 'കേന്ദ്രങ്ങൾ കാണുക →' : 'Find centres →'}
          </Link>
        </div>
      </TrustSection>

      <TrustSection title={ml ? 'മിഥ്യകളും വസ്തുതകളും' : 'Myths vs Facts'}>
        <FAQ items={myths} />
      </TrustSection>

      <TrustSection title="COVID-19" tint="gray">
        <p className="mx-auto max-w-2xl text-center text-sm text-gray-700">
          {ml ? 'ഏറ്റവും പുതിയ COVID-19 മാർഗനിർദേശങ്ങൾക്ക് കേരള ആരോഗ്യ വകുപ്പിനെ പരിശോധിക്കുക.' : 'Check the Kerala Health Department for the latest COVID-19 guidelines.'}
        </p>
      </TrustSection>

      <TrustSection title={ml ? 'റിമൈൻഡർ സേവനം' : 'Reminder service'}>
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-sm text-gray-600">{ml ? 'വാക്സിൻ റിമൈൻഡറുകൾ ഉടൻ വരുന്നു' : 'Vaccine reminders coming soon'}</p>
          <WaitlistForm topic="vaccine-reminder" locale={locale} />
        </div>
      </TrustSection>

      <TrustSection>
        <Disclaimer>{ml ? 'ഈ വിവരങ്ങൾ പൊതുവായതാണ്. നിങ്ങളുടെ വാക്സിൻ ആവശ്യങ്ങൾക്ക് ഡോക്ടറെ സമീപിക്കുക.' : 'This information is general. Consult a doctor for your vaccination needs.'}</Disclaimer>
      </TrustSection>
    </div>
  );
}
