export const PATIENT_NOTES_STORAGE_KEY = 'eltherabito-patient-personal-notes';

const DEFAULT_NOTES = [
  {
    id: '1',
    date: 'Oct 15, 2023',
    author: 'Dr. Sarah',
    text:
      'Ahmed reported feeling much better lately. The anxiety levels have decreased significantly since the last session. We discussed the new coping mechanisms, and he seems to be applying them effectively in his daily routine, especially during work hours. Sleep quality has also improved.',
    latest: true,
  },
];

export function loadPatientNotes() {
  try {
    const saved = localStorage.getItem(PATIENT_NOTES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return structuredClone(DEFAULT_NOTES);
}

export function savePatientNotes(notes) {
  localStorage.setItem(PATIENT_NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export function addPatientNote(text) {
  const trimmed = text.trim();
  if (!trimmed) return loadPatientNotes();

  const note = {
    id: String(Date.now()),
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    author: 'You',
    text: trimmed,
    latest: true,
  };

  const updated = [note, ...loadPatientNotes().map((n) => ({ ...n, latest: false }))];
  savePatientNotes(updated);
  return updated;
}
