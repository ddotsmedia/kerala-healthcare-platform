// i18n.js — locale config and minimal dictionary. Malayalam-first.

const LOCALES = ['ml', 'en'];
const DEFAULT_LOCALE = 'ml';

const DICT = {
  ml: {
    site: 'കേരള ഹെൽത്ത് പോർട്ടൽ',
    doctors: 'ഡോക്ടർമാർ',
    hospitals: 'ആശുപത്രികൾ',
    facilities: 'ക്ലിനിക്കുകൾ & ഡയഗ്നോസ്റ്റിക്സ്',
    clinic: 'ക്ലിനിക്ക്',
    diagnostic_centre: 'ഡയഗ്നോസ്റ്റിക് സെന്റർ',
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
      'ഈ വിവരങ്ങൾ പൊതുവായ അറിവിനു മാത്രമുള്ളതാണ്. ഇത് രോഗനിർണയമോ ചികിത്സാ ഉപദേശമോ അല്ല. എപ്പോഴും യോഗ്യതയുള്ള ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക. അടിയന്തരഘട്ടത്തിൽ 112 അല്ലെങ്കിൽ ആംബുലൻസ് 108 വിളിക്കുക.',
    my_appointments: 'എന്റെ അപ്പോയിന്റ്മെന്റുകൾ',
    upcoming: 'വരാനിരിക്കുന്നവ',
    past: 'കഴിഞ്ഞവ',
    book_now: 'ബുക്ക് ചെയ്യുക',
    book_appointment: 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
    select_slot: 'സമയം തിരഞ്ഞെടുക്കുക',
    no_slots: 'ലഭ്യമായ സമയങ്ങളില്ല',
    cancel: 'റദ്ദാക്കുക',
    confirm: 'സ്ഥിരീകരിക്കുക',
    booking_confirmed: 'അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിച്ചു',
    status: 'നില',
    booking_ref: 'റഫറൻസ്',
    login_required: 'ലോഗിൻ ആവശ്യമാണ് (Phase 2 auth)',
    consultation_room: 'കൺസൾട്ടേഷൻ റൂം',
    reschedule_note: 'പുനഃക്രമീകരണം ഡോക്ടർ കൈകാര്യം ചെയ്യുന്നു',
    health: 'ആരോഗ്യ വിവരങ്ങൾ',
    symptoms: 'ലക്ഷണങ്ങൾ',
    symptom_navigator: 'ലക്ഷണ നാവിഗേറ്റർ',
    diseases: 'രോഗങ്ങൾ',
    tools: 'ആരോഗ്യ ഉപകരണങ്ങൾ',
    find_a_doctor: 'ഡോക്ടറെ കണ്ടെത്തുക',
    not_diagnosis: 'ഇത് രോഗനിർണയമല്ല. ഡോക്ടറെ കാണുക.',
    related_specialists: 'ബന്ധപ്പെട്ട വിദഗ്ധർ',
    when_to_seek: 'എപ്പോൾ ചികിത്സ തേടണം',
    urgency_emergency: 'അടിയന്തരം — 112 / 108 വിളിക്കുക',
    urgency_urgent: 'ഉടൻ ഡോക്ടറെ കാണുക',
    urgency_soon: 'ഉടൻ ഡോക്ടറെ കാണുക',
    urgency_routine: 'സാധാരണ പരിശോധന',
    consult_advice: 'വ്യക്തിഗത ഉപദേശത്തിന് നിങ്ങളുടെ ഡോക്ടറെ സമീപിക്കുക.',
    bmi: 'ബി.എം.ഐ', height: 'ഉയരം', weight: 'ഭാരം', calculate: 'കണക്കാക്കുക',
    result: 'ഫലം', category: 'വിഭാഗം', metric: 'മെട്രിക്', imperial: 'ഇംപീരിയൽ',
    bmi_note: 'ബി.എം.ഐ ഒരു ഏകദേശ അളവാണ്; പേശി, പ്രായം എന്നിവ പരിഗണിക്കുന്നില്ല.',
    underweight: 'കുറഞ്ഞ ഭാരം', normal_weight: 'സാധാരണ', overweight: 'അമിതഭാരം', obese: 'പൊണ്ണത്തടി',
    due_date: 'പ്രസവ തീയതി', lmp: 'അവസാന ആർത്തവ തീയതി', estimated_due: 'കണക്കാക്കിയ പ്രസവ തീയതി',
    trimester: 'ത്രിമാസം', water_intake: 'ജല ഉപഭോഗം', daily_water: 'ദിവസേനയുള്ള ജലം',
    jobs: 'ജോലികൾ', job_search: 'ജോലി തിരയൽ', apply: 'അപേക്ഷിക്കുക',
    apply_login: 'അപേക്ഷിക്കാൻ ലോഗിൻ ചെയ്യുക', requirements: 'യോഗ്യതകൾ',
    employment_type: 'തൊഴിൽ തരം', experience: 'പരിചയം', years: 'വർഷം',
    role: 'റോൾ', employer: 'തൊഴിലുടമ', candidate: 'ഉദ്യോഗാർത്ഥി',
    my_applications: 'എന്റെ അപേക്ഷകൾ', saved_jobs: 'സേവ് ചെയ്ത ജോലികൾ',
    post_job: 'ജോലി പോസ്റ്റ് ചെയ്യുക', applications: 'അപേക്ഷകൾ',
    full_time: 'ഫുൾ ടൈം', part_time: 'പാർട്ട് ടൈം', contract: 'കരാർ', locum: 'ലോക്കം',
    open_to_work: 'ജോലിക്ക് തയ്യാർ'
  },
  en: {
    site: 'Kerala Health Portal',
    doctors: 'Doctors',
    hospitals: 'Hospitals',
    facilities: 'Clinics & Diagnostics',
    clinic: 'Clinic',
    diagnostic_centre: 'Diagnostic Centre',
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
      'This information is for general awareness only. It is not a medical diagnosis or treatment advice. Always consult a qualified healthcare professional. In an emergency call 112 or ambulance 108.',
    my_appointments: 'My appointments',
    upcoming: 'Upcoming',
    past: 'Past',
    book_now: 'Book now',
    book_appointment: 'Book an appointment',
    select_slot: 'Select a slot',
    no_slots: 'No slots available',
    cancel: 'Cancel',
    confirm: 'Confirm',
    booking_confirmed: 'Appointment confirmed',
    status: 'Status',
    booking_ref: 'Ref',
    login_required: 'Login required (Phase 2 auth)',
    consultation_room: 'Consultation room',
    reschedule_note: 'Rescheduling is handled by the doctor',
    health: 'Health information',
    symptoms: 'Symptoms',
    symptom_navigator: 'Symptom navigator',
    diseases: 'Diseases',
    tools: 'Health tools',
    find_a_doctor: 'Find a doctor',
    not_diagnosis: 'This is not a diagnosis. See a doctor.',
    related_specialists: 'Related specialists',
    when_to_seek: 'When to seek care',
    urgency_emergency: 'Emergency — call 112 / 108',
    urgency_urgent: 'See a doctor urgently',
    urgency_soon: 'See a doctor soon',
    urgency_routine: 'Routine check-up',
    consult_advice: 'Consult your doctor for personalised advice.',
    bmi: 'BMI', height: 'Height', weight: 'Weight', calculate: 'Calculate',
    result: 'Result', category: 'Category', metric: 'Metric', imperial: 'Imperial',
    bmi_note: 'BMI is an approximate measure; it does not account for muscle or age.',
    underweight: 'Underweight', normal_weight: 'Normal', overweight: 'Overweight', obese: 'Obese',
    due_date: 'Due date', lmp: 'Last menstrual period', estimated_due: 'Estimated due date',
    trimester: 'Trimester', water_intake: 'Water intake', daily_water: 'Daily water',
    jobs: 'Jobs', job_search: 'Job search', apply: 'Apply',
    apply_login: 'Login to apply', requirements: 'Requirements',
    employment_type: 'Employment type', experience: 'Experience', years: 'yrs',
    role: 'Role', employer: 'Employer', candidate: 'Candidate',
    my_applications: 'My applications', saved_jobs: 'Saved jobs',
    post_job: 'Post a job', applications: 'Applications',
    full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', locum: 'Locum',
    open_to_work: 'Open to work'
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
