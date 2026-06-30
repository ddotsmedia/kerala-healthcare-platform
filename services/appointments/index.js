// services/appointments — slot availability + concurrency-safe booking.

export { getAvailableSlots, getSlotsForRange, isSlotAvailable } from './slots.js';
export { bookSlot, generateBookingRef } from './booking.js';
export { toMinutes, toTime, dayOfWeek } from './time.js';
