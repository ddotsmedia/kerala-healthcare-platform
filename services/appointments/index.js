// services/appointments — slot availability + concurrency-safe booking.

export { getAvailableSlots, getSlotsForRange, isSlotAvailable } from './slots.js';
export { bookSlot, generateBookingRef } from './booking.js';
export { getByFeedbackToken, sendFeedbackRequest, sendPendingFeedbackRequests, markFeedbackCompleted } from './feedback.js';
export { jitsiRoomName, jitsiUrl, generateJitsiRoom, generateJWTConfig, startConsultation, endConsultation, JITSI_HOST } from './video.js';
export { toMinutes, toTime, dayOfWeek } from './time.js';
