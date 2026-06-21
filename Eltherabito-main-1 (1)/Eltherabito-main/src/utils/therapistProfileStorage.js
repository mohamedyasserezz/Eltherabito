export const THERAPIST_PROFILE_STORAGE_KEY = 'eltherabito-therapist-profile';

export const SPECIALIZATIONS = [
  'Family & Relationship Counseling',
  'Clinical Psychology',
  'Cognitive Behavioral Therapy',
  'Psychotherapy',
  'Counseling',
];

const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150';

export const DEFAULT_THERAPIST_PROFILE = {
  photo: DEFAULT_PHOTO,
  specialization: 'Clinical Psychology',
  yearsExperience: '12',
  sessionRate: '$ 150',
};

export function loadTherapistProfile() {
  try {
    const saved = localStorage.getItem(THERAPIST_PROFILE_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_THERAPIST_PROFILE, ...JSON.parse(saved) };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_THERAPIST_PROFILE };
}

export function saveTherapistProfile(data) {
  localStorage.setItem(THERAPIST_PROFILE_STORAGE_KEY, JSON.stringify(data));
}

export function formatExperience(years) {
  const n = String(years).trim();
  return n ? `${n} Years` : '—';
}

export function formatSessionRate(rate) {
  const cleaned = String(rate).replace(/\s+/g, ' ').trim();
  if (!cleaned) return '—';
  if (cleaned.includes('/')) return cleaned;
  const numeric = cleaned.replace(/[^0-9.]/g, '');
  return numeric ? `$${numeric} / hr` : cleaned;
}
