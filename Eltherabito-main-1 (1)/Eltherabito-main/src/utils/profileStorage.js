export const PROFILE_STORAGE_KEY = 'eltherabito-profile';

const DEFAULT_EMAIL = 'ahmed.ali@example.com';
const DEFAULT_PHONE = '+20 100 123 4567';

export function loadSavedPhone() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.phone) return data.phone;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PHONE;
}

export function loadSavedContact() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        mobile: data.phone || DEFAULT_PHONE,
        email: data.email || DEFAULT_EMAIL,
      };
    }
  } catch {
    /* ignore */
  }
  return { mobile: DEFAULT_PHONE, email: DEFAULT_EMAIL };
}
