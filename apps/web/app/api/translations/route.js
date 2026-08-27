const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      back: 'Back'
    },
    health: {
      prescriptions: 'Prescriptions',
      waitingList: 'Waiting List',
      challenges: 'Health Challenges',
      labReports: 'Lab Reports',
      myPolicies: 'My Policies'
    },
    services: {
      nursing: 'Home Nursing',
      medicine: 'Medicines',
      labTests: 'Lab Tests',
      equipment: 'Equipment Rental'
    }
  },
  ml: {
    common: {
      loading: 'ലോഡ് ചെയ്യുന്നു...',
      error: 'ഒരു പിശക് സംഭവിച്ചു',
      cancel: 'റദ്ദാക്കുക',
      save: 'സംരക്ഷിക്കുക',
      delete: 'ഇല്ലാതാക്കുക',
      back: 'വിപരീതം'
    },
    health: {
      prescriptions: 'കുറിപ്പുകൾ',
      waitingList: 'കാത്തിരിപ്പ് പട്ടിക',
      challenges: 'ആരോഗ്യ വെല്ലുവിളികൾ',
      labReports: 'ল്যാബ് റിപ്പോർട്ടുകൾ',
      myPolicies: 'എന്റെ നയങ്ങൾ'
    },
    services: {
      nursing: 'വീട്ടിലെ നഴ്സിംഗ്',
      medicine: 'മരുന്നുകൾ',
      labTests: 'ലാബ് പരിശോധനകൾ',
      equipment: 'ഉപകരണ വാടകയ്ക്ക്'
    }
  },
  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'एक त्रुटि हुई',
      cancel: 'रद्द करें',
      save: 'बचाना',
      delete: 'हटाना',
      back: 'पीछे'
    }
  },
  ta: {
    common: {
      loading: 'ஏற்றுதல்...',
      error: 'ஒரு பிழை ஏற்பட்டது',
      cancel: 'ரத்து செய்யவும்',
      save: 'சேமிக்கவும்',
      delete: 'நீக்கவும்',
      back: 'பின்னோக்கி'
    }
  },
  kn: {
    common: {
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      error: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      save: 'ಉಳಿಸಿ',
      delete: 'ಅಳಿಸಿ',
      back: 'ಹಿಂದೆ'
    }
  }
}

export async function GET(req) {
  const url = new URL(req.url)
  const locale = url.searchParams.get('locale') || 'en'
  const namespace = url.searchParams.get('namespace') || 'common'

  const trans = translations[locale] || translations.en

  return Response.json({
    data: { [namespace]: trans[namespace] || {} },
    locale
  })
}
