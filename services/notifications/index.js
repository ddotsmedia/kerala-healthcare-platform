// services/notifications — appointment notifications (SMS + email) + audit log.

export { notifyAppointmentEvent, sendReminders } from './notify.js';
export { sendSms } from './sms.js';
export { sendEmail } from './email.js';
export { isQuietHours } from './quiet-hours.js';
