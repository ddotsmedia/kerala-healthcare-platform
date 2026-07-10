// whatsapp.js — build wa.me deep links with pre-filled messages. No WhatsApp
// Business API: the user taps the link and their WhatsApp opens with the text
// ready to send. Pure string builders — safe to import in client or server.

/** Strip everything but digits; default Indian country code (91) if 10-digit. */
function normalizeNumber(raw) {
  const d = String(raw || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.length === 10) return `91${d}`;
  return d.replace(/^0+/, '');
}

const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');
const fmtDate = (d) => (d ? (typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10)) : '');

/**
 * Reminder message the patient sends to their doctor.
 * @param {object} a { provider_name, patient_name, slot_date, slot_start, consultation_mode, booking_ref }
 * @param {'ml'|'en'} locale
 */
function reminderMessage(a, locale = 'ml') {
  const when = `${fmtDate(a.slot_date)} ${fmtTime(a.slot_start)}`;
  if (locale === 'en') {
    return `Hello Dr. ${a.provider_name}, I have a ${a.consultation_mode} appointment on ${when}.\n`
      + `Booking ref: ${a.booking_ref}\nPatient: ${a.patient_name || ''}\nMalayaliDoctor.com`;
  }
  return `നമസ്കാരം Dr. ${a.provider_name}, ${when}-ന് ${a.consultation_mode} appointment ഉണ്ട്.\n`
    + `Booking ref: ${a.booking_ref}\nPatient: ${a.patient_name || ''}\nMalayaliDoctor.com`;
}

/** Family-share message (no specific recipient — WhatsApp shows a chooser). */
function shareMessage(a, locale = 'ml') {
  const when = `${fmtDate(a.slot_date)} ${fmtTime(a.slot_start)}`;
  if (locale === 'en') {
    return `Appointment with Dr. ${a.provider_name} on ${when} (${a.consultation_mode}).\n`
      + `Booking ref: ${a.booking_ref}\nMalayaliDoctor.com`;
  }
  return `Dr. ${a.provider_name}-യുമായി ${when}-ന് appointment (${a.consultation_mode}).\n`
    + `Booking ref: ${a.booking_ref}\nMalayaliDoctor.com`;
}

/** wa.me link to the doctor's WhatsApp (null if the doctor has no number). */
function generateWhatsAppReminderLink(a, locale = 'ml') {
  const num = normalizeNumber(a.whatsapp_number);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(reminderMessage(a, locale))}`;
}

/** wa.me link with no recipient — shares the appointment with anyone. */
function shareAppointmentLink(a, locale = 'ml') {
  return `https://wa.me/?text=${encodeURIComponent(shareMessage(a, locale))}`;
}

export { generateWhatsAppReminderLink, shareAppointmentLink, reminderMessage, shareMessage, normalizeNumber };
