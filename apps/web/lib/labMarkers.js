// labMarkers.js — tracked lab parameters (pure; shared server+client).
// normal {min,max} is the reference band; a report may override via normal_min/max.

const MARKERS = [
  { key: 'hba1c', ml: 'HbA1c', en: 'HbA1c', unit: '%', normal: { min: 4, max: 5.7 } },
  { key: 'glucose_fasting', ml: 'ഫാസ്റ്റിംഗ് ഗ്ലൂക്കോസ്', en: 'Fasting glucose', unit: 'mg/dL', normal: { min: 70, max: 100 } },
  { key: 'cholesterol_total', ml: 'ആകെ കൊളസ്ട്രോൾ', en: 'Total cholesterol', unit: 'mg/dL', normal: { min: null, max: 200 } },
  { key: 'ldl', ml: 'LDL', en: 'LDL', unit: 'mg/dL', normal: { min: null, max: 100 } },
  { key: 'hdl', ml: 'HDL', en: 'HDL', unit: 'mg/dL', normal: { min: 40, max: null } },
  { key: 'tsh', ml: 'TSH', en: 'TSH', unit: 'mIU/L', normal: { min: 0.4, max: 4.0 } },
  { key: 'creatinine', ml: 'ക്രിയാറ്റിനിൻ', en: 'Creatinine', unit: 'mg/dL', normal: { min: 0.6, max: 1.3 } },
  { key: 'haemoglobin', ml: 'ഹീമോഗ്ലോബിൻ', en: 'Haemoglobin', unit: 'g/dL', normal: { min: 12, max: 17 } },
  { key: 'uric_acid', ml: 'യൂറിക് ആസിഡ്', en: 'Uric acid', unit: 'mg/dL', normal: { min: 3.5, max: 7.2 } }
];

const REPORT_TYPES = ['cbc', 'lipid', 'thyroid', 'diabetes', 'kidney', 'liver', 'other'];
const MARKER_KEYS = MARKERS.map((m) => m.key);
const markerByKey = (k) => MARKERS.find((m) => m.key === k) || null;

/** Band for a result: report's own normal_min/max override the marker default. */
function bandFor(key, result) {
  const m = markerByKey(key);
  const lo = result && result.normal_min != null ? Number(result.normal_min) : (m ? m.normal.min : null);
  const hi = result && result.normal_max != null ? Number(result.normal_max) : (m ? m.normal.max : null);
  return { min: lo, max: hi };
}

/** @returns {boolean|null} true=out of range, false=in range, null=no band */
function isOutOfRange(key, value, result) {
  if (value == null) return null;
  const { min, max } = bandFor(key, result);
  if (min == null && max == null) return null;
  if (min != null && value < min) return true;
  if (max != null && value > max) return true;
  return false;
}

export { MARKERS, MARKER_KEYS, REPORT_TYPES, markerByKey, bandFor, isOutOfRange };
