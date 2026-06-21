export const SCHEDULE_STORAGE_KEY = 'eltherabito-therapist-schedule';
const LEGACY_STORAGE_KEY = 'scheduleData';

export const SCHEDULE_DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const DEFAULT_SCHEDULE = {
  monday: { active: true, slots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
  tuesday: { active: false, slots: [] },
  wednesday: { active: false, slots: [] },
  thursday: { active: false, slots: [] },
  friday: { active: false, slots: [] },
  saturday: { active: false, slots: [] },
  sunday: { active: false, slots: [] },
};

export const DEFAULT_TABLE_SCHEDULE = [
  {
    day: 'Monday',
    closed: false,
    slots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'],
  },
  {
    day: 'Tuesday',
    closed: false,
    slots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'],
  },
  {
    day: 'Wednesday',
    closed: false,
    slots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'],
  },
  {
    day: 'Thursday',
    closed: false,
    slots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'],
  },
  {
    day: 'Friday',
    closed: false,
    slots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'],
  },
  { day: 'Saturday', closed: true, slots: [] },
  { day: 'Sunday', closed: true, slots: [] },
];

function migrateLegacySchedule() {
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy || localStorage.getItem(SCHEDULE_STORAGE_KEY)) return null;

    const parsed = JSON.parse(legacy);
    const migrated = structuredClone(DEFAULT_SCHEDULE);

    SCHEDULE_DAYS.forEach(({ id }) => {
      if (Array.isArray(parsed[id])) {
        migrated[id] = {
          active: parsed[id].length > 0,
          slots: parsed[id],
        };
      }
    });

    saveSchedule(migrated);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

export function loadSchedule() {
  const migrated = migrateLegacySchedule();
  if (migrated) return migrated;

  try {
    const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...structuredClone(DEFAULT_SCHEDULE), ...parsed };
    }
  } catch {
    /* ignore */
  }
  return structuredClone(DEFAULT_SCHEDULE);
}

export function saveSchedule(data) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(data));
}

export function hasSavedSchedule() {
  return Boolean(localStorage.getItem(SCHEDULE_STORAGE_KEY));
}

export function getDisplaySchedule() {
  if (!hasSavedSchedule()) return DEFAULT_TABLE_SCHEDULE;

  return SCHEDULE_DAYS.map(({ id, label }) => {
    const day = loadSchedule()[id];
    return {
      day: label,
      closed: !day?.active,
      slots: day?.active ? day.slots : [],
    };
  });
}
