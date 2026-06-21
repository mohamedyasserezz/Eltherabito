export const SELECTED_THERAPIST_KEY = 'eltherabito-selected-therapist';
export const BOOKING_KEY = 'eltherabito-booking';
export const BOOKING_CONFIRMATION_KEY = 'eltherabito-booking-confirmation';

export function saveSelectedTherapist(name) {
  localStorage.setItem(
    SELECTED_THERAPIST_KEY,
    JSON.stringify({ therapist: name, selectedAt: new Date().toISOString() })
  );
}

export function getSelectedTherapist() {
  try {
    const saved = localStorage.getItem(SELECTED_THERAPIST_KEY);
    if (saved) return JSON.parse(saved).therapist;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveBooking(data) {
  localStorage.setItem(BOOKING_KEY, JSON.stringify(data));
}

export function getBooking() {
  try {
    const saved = localStorage.getItem(BOOKING_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return null;
}

export function saveBookingConfirmation(data) {
  localStorage.setItem(BOOKING_CONFIRMATION_KEY, JSON.stringify(data));
}
