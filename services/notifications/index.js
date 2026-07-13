// services/notifications — appointment notifications (SMS + email) + audit log.

export { notifyAppointmentEvent, sendReminders } from './notify.js';
export { sendSms } from './sms.js';
export { sendEmail } from './email.js';
export { logNotification } from './log.js';
export { otpEmailTemplate } from './templates/otp-email.js';
export { isQuietHours } from './quiet-hours.js';
export { generateWhatsAppReminderLink, shareAppointmentLink } from './whatsapp.js';
export { sendDueMedicationReminders } from './med-reminders.js';
