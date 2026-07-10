// metricConfig.js — health-tracker metric catalogue (pure; shared server+client).
// normal {min,max} defines the healthy band; values outside are flagged.

const METRIC_TYPES = [
  'weight', 'systolic_bp', 'diastolic_bp', 'blood_sugar_fasting', 'blood_sugar_pp',
  'heart_rate', 'spo2', 'steps', 'sleep_hours', 'mood', 'temperature', 'hba1c'
];

const UNIT = {
  weight: 'kg', systolic_bp: 'mmHg', diastolic_bp: 'mmHg',
  blood_sugar_fasting: 'mg_dL', blood_sugar_pp: 'mg_dL', heart_rate: 'bpm',
  spo2: '%', steps: 'steps', sleep_hours: 'hours', mood: 'score', temperature: 'C', hba1c: '%'
};

// Healthy band per type (null side = unbounded). Used to flag out-of-range.
const NORMAL = {
  systolic_bp: { min: 90, max: 130 }, diastolic_bp: { min: 60, max: 85 },
  blood_sugar_fasting: { min: 70, max: 100 }, blood_sugar_pp: { min: 70, max: 140 },
  heart_rate: { min: 60, max: 100 }, spo2: { min: 95, max: null },
  sleep_hours: { min: 6, max: 9 }, temperature: { min: 36.1, max: 37.5 }, hba1c: { min: null, max: 5.7 }
};

const RANGE_TEXT = {
  systolic_bp: { ml: 'സാധാരണം: 90–130', en: 'Normal: 90–130' },
  diastolic_bp: { ml: 'സാധാരണം: 60–85', en: 'Normal: 60–85' },
  blood_sugar_fasting: { ml: 'സാധാരണം: 70–100 (ഫാസ്റ്റിംഗ്)', en: 'Normal: 70–100 mg/dL (fasting)' },
  blood_sugar_pp: { ml: 'സാധാരണം: <140 (PP)', en: 'Normal: <140 mg/dL (post-prandial)' },
  heart_rate: { ml: 'സാധാരണം: 60–100 bpm', en: 'Normal: 60–100 bpm' },
  spo2: { ml: 'സാധാരണം: ≥95%', en: 'Normal: ≥95%' },
  sleep_hours: { ml: 'ശുപാർശ: 7–9 മണിക്കൂർ', en: 'Recommended: 7–9 hours' },
  temperature: { ml: 'സാധാരണം: 36.1–37.5°C', en: 'Normal: 36.1–37.5°C' },
  hba1c: { ml: 'സാധാരണം: <5.7%', en: 'Normal: <5.7%' }
};

// Cards shown in the tracker. kind drives the input UI.
const CARDS = [
  { key: 'weight', icon: '⚖️', ml: 'ഭാരം', en: 'Weight', kind: 'single', step: '0.1' },
  { key: 'bp', icon: '🩸', ml: 'രക്തസമ്മർദ്ദം', en: 'Blood Pressure', kind: 'bp' },
  { key: 'sugar', icon: '🍬', ml: 'രക്തത്തിലെ പഞ്ചസാര', en: 'Blood Sugar', kind: 'sugar' },
  { key: 'heart_rate', icon: '❤️', ml: 'ഹൃദയമിടിപ്പ്', en: 'Heart Rate', kind: 'single', step: '1' },
  { key: 'spo2', icon: '🫁', ml: 'ഓക്സിജൻ (SpO2)', en: 'SpO2', kind: 'single', step: '1' },
  { key: 'sleep_hours', icon: '😴', ml: 'ഉറക്കം', en: 'Sleep', kind: 'single', step: '0.5' },
  { key: 'steps', icon: '🚶', ml: 'സ്റ്റെപ്പുകൾ', en: 'Steps', kind: 'single', step: '1' },
  { key: 'mood', icon: '😊', ml: 'മാനസികാവസ്ഥ', en: 'Mood', kind: 'mood' },
  { key: 'temperature', icon: '🌡️', ml: 'താപനില', en: 'Temperature', kind: 'single', step: '0.1' },
  { key: 'hba1c', icon: '🧪', ml: 'HbA1c', en: 'HbA1c', kind: 'single', step: '0.1' }
];

/** @returns {boolean|null} true=out of range, false=in range, null=no band defined */
function isOutOfRange(type, value) {
  const n = NORMAL[type];
  if (!n || value == null) return null;
  if (n.min != null && value < n.min) return true;
  if (n.max != null && value > n.max) return true;
  return false;
}

export { METRIC_TYPES, UNIT, NORMAL, RANGE_TEXT, CARDS, isOutOfRange };
