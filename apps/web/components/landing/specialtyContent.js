// specialtyContent.js — educational specialty descriptions (ml + en).
// No diagnosis, no treatment advice. Each ends by directing to a specialist.

const CLOSER_ML = 'യോഗ്യതയുള്ള വിദഗ്ധനെ സമീപിക്കുക.';
const CLOSER_EN = 'Consult a qualified specialist.';

export const SPECIALTY_DESC = {
  'general-physician': {
    ml: 'ജനറൽ ഫിസിഷ്യൻമാർ സാധാരണ ആരോഗ്യ പ്രശ്നങ്ങൾക്കുള്ള ആദ്യ സമ്പർക്കമാണ്. പനി, അണുബാധകൾ, ദീർഘകാല രോഗങ്ങളുടെ പരിചരണം എന്നിവയിൽ അവർ സഹായിക്കുന്നു.',
    en: 'General physicians are the first point of contact for common health concerns. They help with fevers, infections, and the ongoing care of long-term conditions.'
  },
  pediatrics: {
    ml: 'ശിശുരോഗ വിദഗ്ധർ നവജാത ശിശുക്കൾ മുതൽ കൗമാരക്കാർ വരെയുള്ള കുട്ടികളുടെ ആരോഗ്യം പരിപാലിക്കുന്നു. വളർച്ച, വാക്സിനേഷൻ, കുട്ടിക്കാല രോഗങ്ങൾ എന്നിവ അവർ ശ്രദ്ധിക്കുന്നു.',
    en: 'Pediatricians care for the health of children from newborns to adolescents. They monitor growth, vaccinations, and childhood illnesses.'
  },
  cardiology: {
    ml: 'ഹൃദ്രോഗ വിദഗ്ധർ ഹൃദയത്തിന്റെയും രക്തക്കുഴലുകളുടെയും ആരോഗ്യത്തിൽ വൈദഗ്ധ്യമുള്ളവരാണ്. രക്തസമ്മർദ്ദം, ഹൃദയമിടിപ്പ്, ഹൃദയ പരിചരണം എന്നിവ അവർ കൈകാര്യം ചെയ്യുന്നു.',
    en: 'Cardiologists specialise in the health of the heart and blood vessels. They manage blood pressure, heart rhythm, and overall cardiac care.'
  },
  dermatology: {
    ml: 'ത്വക്രോഗ വിദഗ്ധർ ചർമ്മം, മുടി, നഖങ്ങൾ എന്നിവയുടെ ആരോഗ്യത്തിൽ ശ്രദ്ധിക്കുന്നു. ചർമ്മ അലർജികൾ, മുഖക്കുരു, ചർമ്മ പരിചരണം എന്നിവ അവർ കൈകാര്യം ചെയ്യുന്നു.',
    en: 'Dermatologists focus on the health of skin, hair, and nails. They address skin allergies, acne, and general skin care.'
  },
  orthopedics: {
    ml: 'അസ്ഥിരോഗ വിദഗ്ധർ എല്ലുകൾ, സന്ധികൾ, പേശികൾ എന്നിവയുടെ ആരോഗ്യത്തിൽ വൈദഗ്ധ്യമുള്ളവരാണ്. ഒടിവുകൾ, സന്ധി വേദന, ചലന പ്രശ്നങ്ങൾ എന്നിവ അവർ പരിചരിക്കുന്നു.',
    en: 'Orthopedic specialists care for bones, joints, and muscles. They treat fractures, joint pain, and mobility concerns.'
  },
  gynecology: {
    ml: 'ഗൈനക്കോളജിസ്റ്റുകൾ സ്ത്രീകളുടെ പ്രത്യുത്പാദന ആരോഗ്യത്തിൽ ശ്രദ്ധിക്കുന്നു. ഗർഭകാല പരിചരണം, സ്ത്രീ ആരോഗ്യ പരിശോധനകൾ എന്നിവ അവർ നൽകുന്നു.',
    en: 'Gynecologists focus on women’s reproductive health. They provide pregnancy care and routine women’s health check-ups.'
  },
  ent: {
    ml: 'ഇ.എൻ.ടി വിദഗ്ധർ ചെവി, മൂക്ക്, തൊണ്ട എന്നിവയുടെ ആരോഗ്യത്തിൽ വൈദഗ്ധ്യമുള്ളവരാണ്. കേൾവി, സൈനസ്, തൊണ്ട പ്രശ്നങ്ങൾ എന്നിവ അവർ കൈകാര്യം ചെയ്യുന്നു.',
    en: 'ENT specialists focus on the ears, nose, and throat. They address hearing, sinus, and throat concerns.'
  },
  ophthalmology: {
    ml: 'നേത്രരോഗ വിദഗ്ധർ കണ്ണിന്റെ ആരോഗ്യത്തിലും കാഴ്ചയിലും ശ്രദ്ധിക്കുന്നു. കാഴ്ച പരിശോധന, കണ്ണട, കണ്ണ് പരിചരണം എന്നിവ അവർ നൽകുന്നു.',
    en: 'Ophthalmologists care for eye health and vision. They provide eye tests, corrective lenses, and general eye care.'
  },
  dentistry: {
    ml: 'ദന്തരോഗ വിദഗ്ധർ പല്ലുകളുടെയും മോണകളുടെയും ആരോഗ്യത്തിൽ ശ്രദ്ധിക്കുന്നു. പല്ല് വൃത്തിയാക്കൽ, ദന്ത പരിചരണം എന്നിവ അവർ നൽകുന്നു.',
    en: 'Dentists care for the health of teeth and gums. They provide cleanings and routine dental care.'
  },
  psychiatry: {
    ml: 'മനോരോഗ വിദഗ്ധർ മാനസികാരോഗ്യത്തിലും വൈകാരിക ക്ഷേമത്തിലും ശ്രദ്ധിക്കുന്നു. സമ്മർദ്ദം, ഉറക്കം, മാനസിക ക്ഷേമം എന്നിവയിൽ അവർ പിന്തുണ നൽകുന്നു.',
    en: 'Psychiatrists focus on mental health and emotional well-being. They support concerns around stress, sleep, and overall mental wellness.'
  },
  neurology: {
    ml: 'ന്യൂറോളജിസ്റ്റുകൾ തലച്ചോറിന്റെയും നാഡീവ്യൂഹത്തിന്റെയും ആരോഗ്യത്തിൽ വൈദഗ്ധ്യമുള്ളവരാണ്. തലവേദന, ഓർമ്മ, നാഡീ സംബന്ധമായ പരിചരണം എന്നിവ അവർ കൈകാര്യം ചെയ്യുന്നു.',
    en: 'Neurologists specialise in the brain and nervous system. They address headaches, memory concerns, and nerve-related care.'
  },
  'general-surgery': {
    ml: 'ജനറൽ സർജന്മാർ ശസ്ത്രക്രിയാ പരിചരണത്തിൽ വൈദഗ്ധ്യമുള്ളവരാണ്. വിവിധ ശസ്ത്രക്രിയാ വിലയിരുത്തലുകളും പരിചരണവും അവർ നൽകുന്നു.',
    en: 'General surgeons specialise in surgical care. They provide a range of surgical assessments and procedures.'
  }
};

export function specialtyDescription(slug, locale = 'ml') {
  const d = SPECIALTY_DESC[slug];
  if (!d) return locale === 'ml' ? CLOSER_ML : CLOSER_EN;
  const closer = locale === 'ml' ? CLOSER_ML : CLOSER_EN;
  return `${locale === 'ml' ? d.ml : d.en} ${closer}`;
}
