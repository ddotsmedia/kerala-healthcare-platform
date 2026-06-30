// appointmentNotify.js — thin trigger layer between the API routes and the
// notification service. Real SMS/email sending is wired in Task 2.4
// (services/notifications) — this file is rewired there. Kept side-effect-safe:
// never throws into the request path.

export async function onAppointmentBooked(appointmentId) {
  console.log(`[notify] appointment booked: ${appointmentId}`);
}

export async function onAppointmentCancelled(appointmentId, byRole) {
  console.log(`[notify] appointment cancelled by ${byRole}: ${appointmentId}`);
}

export async function onAppointmentRescheduled(appointmentId) {
  console.log(`[notify] appointment rescheduled: ${appointmentId}`);
}
