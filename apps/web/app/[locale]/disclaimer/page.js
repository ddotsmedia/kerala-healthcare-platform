// Medical Disclaimer (standalone).

import { resolveLocale } from '@/lib/i18n';
import { ProseDoc } from '@/components/trust/TrustParts';

const UPDATED = '2026-07-03';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'മെഡിക്കൽ നിരാകരണം | MalayaliDoctor' : 'Medical Disclaimer | MalayaliDoctor' };
}

export default async function DisclaimerPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';

  const sections = [
    { heading: ml ? 'വിവരങ്ങൾ മാത്രം' : 'Information only',
      paras: [ml ? 'ഈ പ്ലാറ്റ്ഫോം ആരോഗ്യ വിവരങ്ങൾ മാത്രം നൽകുന്നു.' : 'This platform provides health information only.']},
    { heading: ml ? 'വൈദ്യോപദേശത്തിന് പകരമല്ല' : 'Not a substitute for medical advice',
      paras: [ml ? 'ഇവിടെയുള്ള ഉള്ളടക്കം പ്രൊഫഷണൽ വൈദ്യോപദേശത്തിന് പകരമല്ല. എപ്പോഴും യോഗ്യതയുള്ള ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക.' : 'The content here is not a substitute for professional medical advice. Always consult a qualified healthcare professional.']},
    { heading: ml ? 'അടിയന്തരം' : 'Emergency',
      paras: [ml ? 'അടിയന്തര ഘട്ടങ്ങളിൽ ഉടൻ 112 അല്ലെങ്കിൽ ആംബുലൻസിന് 108 എന്ന നമ്പറിൽ വിളിക്കുക.' : 'In an emergency, call 112 or 108 (ambulance) immediately.']},
    { heading: ml ? 'ഉള്ളടക്ക അവലോകനം' : 'Content review',
      paras: [ml ? 'ആരോഗ്യ ഉള്ളടക്കം യോഗ്യതയുള്ള പ്രൊഫഷണലുകൾ അവലോകനം ചെയ്യുന്നു. AI-ജനറേറ്റഡ് ഉള്ളടക്കം അതായി ലേബൽ ചെയ്യുന്നു.' : 'Health content is reviewed by qualified professionals. AI-generated content is labelled as such.']}
  ];

  return (
    <div className="-my-6">
      <ProseDoc title={ml ? 'മെഡിക്കൽ നിരാകരണം' : 'Medical Disclaimer'} lastUpdated={UPDATED} locale={locale} sections={sections} />
      <div className="mx-auto -mt-6 max-w-3xl px-4 pb-6">
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          🚨 {ml ? 'അടിയന്തരം: 112 · ആംബുലൻസ്: 108' : 'Emergency: 112 · Ambulance: 108'}
        </div>
      </div>
    </div>
  );
}
