// i18n.js — locale config and minimal dictionary. Malayalam-first.

const LOCALES = ['ml', 'en'];
const DEFAULT_LOCALE = 'ml';

const DICT = {
  ml: {
    site: 'കേരള ഹെൽത്ത് പോർട്ടൽ',
    doctors: 'ഡോക്ടർമാർ',
    hospitals: 'ആശുപത്രികൾ',
    find_doctor: 'ഡോക്ടറെ കണ്ടെത്തുക',
    find_hospital: 'ആശുപത്രി കണ്ടെത്തുക',
    search_placeholder: 'പേര്, സ്പെഷ്യാലിറ്റി, ജില്ല…',
    search: 'തിരയുക',
    verified: 'പരിശോധിച്ചു',
    experience: 'വർഷത്തെ പരിചയം',
    consultation_fee: 'കൺസൾട്ടേഷൻ ഫീസ്',
    no_results: 'ഫലങ്ങളൊന്നുമില്ല',
    emergency_24x7: '24x7 എമർജൻസി',
    beds: 'കിടക്കകൾ',
    departments: 'വിഭാഗങ്ങൾ',
    services: 'സേവനങ്ങൾ',
    accreditations: 'അക്രഡിറ്റേഷനുകൾ',
    disclaimer:
      'ഈ വിവരങ്ങൾ പൊതുവായ അറിവിനു മാത്രമുള്ളതാണ്. ഇത് രോഗനിർണയമോ ചികിത്സാ ഉപദേശമോ അല്ല. എപ്പോഴും യോഗ്യതയുള്ള ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 അല്ലെങ്കിൽ ആംബുലൻസ് 108 വിളിക്കുക.'
  },
  en: {
    site: 'Kerala Health Portal',
    doctors: 'Doctors',
    hospitals: 'Hospitals',
    find_doctor: 'Find a doctor',
    find_hospital: 'Find a hospital',
    search_placeholder: 'Name, specialty, district…',
    search: 'Search',
    verified: 'Verified',
    experience: 'years experience',
    consultation_fee: 'Consultation fee',
    no_results: 'No results found',
    emergency_24x7: '24x7 Emergency',
    beds: 'beds',
    departments: 'Departments',
    services: 'Services',
    accreditations: 'Accreditations',
    disclaimer:
      'This information is for general awareness only. It is not a medical diagnosis or treatment advice. Always consult a qualified healthcare professional. In an emergency call 112 or ambulance 108.'
  }
};

/**
 * @param {string} locale
 * @returns {string} a valid locale, falling back to the default.
 */
function resolveLocale(locale) {
  return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Translate a key for a locale.
 * @param {string} locale
 * @param {string} key
 */
function t(locale, key) {
  const l = resolveLocale(locale);
  return (DICT[l] && DICT[l][key]) || (DICT[DEFAULT_LOCALE][key]) || key;
}

export { LOCALES, DEFAULT_LOCALE, resolveLocale, t };
