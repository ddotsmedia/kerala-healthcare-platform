// appointmentNotify.js — trigger layer between API routes and the notification
// service (@khp/notifications). Side-effect-safe: never throws into the request
// path. In production these run as BullMQ jobs; here they fire inline.

import { notifyAppointmentEvent } from '@khp/notifications';

export async function onAppointmentBooked(appointmentId) {
  try { await notifyAppointmentEvent('confirmed', appointmentId); }
  catch (err) { console.error(`notify booked failed: ${err.message}`); }
}

export async function onAppointmentCancelled(appointmentId, byRole) {
  try { await notifyAppointmentEvent('cancelled', appointmentId, { byRole }); }
  catch (err) { console.error(`notify cancelled failed: ${err.message}`); }
}

export async function onAppointmentRescheduled(appointmentId) {
  try { await notifyAppointmentEvent('rescheduled', appointmentId); }
  catch (err) { console.error(`notify rescheduled failed: ${err.message}`); }
}
