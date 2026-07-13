// goalConfig.js — health-goal types (pure; shared server+client).
// metricType links a goal to a health-tracker metric so progress auto-updates.
// direction: 'down' = lower is better (weight, BP…), 'up' = higher is better.

const GOAL_TYPES = [
  { key: 'weight', metricType: 'weight', ml: 'ഭാര ലക്ഷ്യം', en: 'Weight target', unit: 'kg', direction: 'down' },
  { key: 'systolic_bp', metricType: 'systolic_bp', ml: 'സിസ്റ്റോളിക് BP', en: 'Systolic BP', unit: 'mmHg', direction: 'down' },
  { key: 'blood_sugar', metricType: 'blood_sugar_fasting', ml: 'രക്തത്തിലെ പഞ്ചസാര', en: 'Blood sugar (fasting)', unit: 'mg/dL', direction: 'down' },
  { key: 'steps', metricType: 'steps', ml: 'സ്റ്റെപ്പുകൾ/ദിവസം', en: 'Steps / day', unit: 'steps', direction: 'up' },
  { key: 'sleep', metricType: 'sleep_hours', ml: 'ഉറക്കം', en: 'Sleep', unit: 'hours', direction: 'up' },
  { key: 'hba1c', metricType: 'hba1c', ml: 'HbA1c', en: 'HbA1c', unit: '%', direction: 'down' },
  { key: 'custom', metricType: null, ml: 'ഇഷ്ടാനുസൃതം', en: 'Custom', unit: '', direction: 'down' }
];

const GOAL_KEYS = GOAL_TYPES.map((g) => g.key);
const goalByKey = (k) => GOAL_TYPES.find((g) => g.key === k) || null;

/** Progress toward the target as 0-100, direction-aware. */
function progressPct(goal) {
  const start = Number(goal.start_value);
  const target = Number(goal.target_value);
  const cur = Number(goal.current_value);
  if (![start, target, cur].every(Number.isFinite) || start === target) return cur === target ? 100 : 0;
  const dir = goalByKey(goal.goal_type)?.direction || 'down';
  const pct = dir === 'up' ? (cur - start) / (target - start) : (start - cur) / (start - target);
  return Math.max(0, Math.min(100, Math.round(pct * 100)));
}

/** Has the goal reached its target (direction-aware)? */
function isAchieved(goal) {
  const target = Number(goal.target_value);
  const cur = Number(goal.current_value);
  if (!Number.isFinite(target) || !Number.isFinite(cur)) return false;
  const dir = goalByKey(goal.goal_type)?.direction || 'down';
  return dir === 'up' ? cur >= target : cur <= target;
}

export { GOAL_TYPES, GOAL_KEYS, goalByKey, progressPct, isAchieved };
