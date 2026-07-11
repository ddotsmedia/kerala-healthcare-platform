// services/appointments — slot availability + concurrency-safe booking.

export { getAvailableSlots, getSlotsForRange, isSlotAvailable } from './slots.js';
export { bookSlot, generateBookingRef } from './booking.js';
export { getByFeedbackToken, sendFeedbackRequest, sendPendingFeedbackRequests, markFeedbackCompleted } from './feedback.js';
export { toMinutes, toTime, dayOfWeek } from './time.js';
