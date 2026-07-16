// bloodConstants.js — PURE, client-safe blood-registry constants.
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
export const URGENCY = ['urgent', 'high', 'normal'];
export const URGENCY_LABEL = {
  urgent: { ml: 'അടിയന്തരം', en: 'Urgent', cls: 'bg-red-600 text-white' },
  high: { ml: 'ഉയർന്നത്', en: 'High', cls: 'bg-orange-100 text-orange-700' },
  normal: { ml: 'സാധാരണം', en: 'Normal', cls: 'bg-gray-100 text-gray-600' }
};
