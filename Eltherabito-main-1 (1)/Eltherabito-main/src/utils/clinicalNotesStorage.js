const NOTES_KEY_PREFIX = 'eltherabito-clinical-notes-';

const DEFAULT_NOTE = {
  date: 'Oct 15, 2023',
  author: 'Dr. Sarah',
  text:
    'Patient reported feeling much better lately. Anxiety levels have decreased significantly since the last session. We discussed coping mechanisms applied effectively during work hours. Sleep quality has also improved.',
};

/** @param {string} patientKey — temporary key (session/name) until API patient id */
function storageKey(patientKey) {
  return `${NOTES_KEY_PREFIX}${patientKey}`;
}

export function loadClinicalNotes(patientKey) {
  try {
    const saved = localStorage.getItem(storageKey(patientKey));
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return [{ ...DEFAULT_NOTE, id: '1', latest: true }];
}

export function saveClinicalNotes(patientKey, notes) {
  localStorage.setItem(storageKey(patientKey), JSON.stringify(notes));
}

export function addClinicalNote(patientKey, text, author = 'Dr. Sarah') {
  const trimmed = text.trim();
  if (!trimmed) return loadClinicalNotes(patientKey);

  const note = {
    id: String(Date.now()),
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    author,
    text: trimmed,
    latest: true,
  };

  const updated = [note, ...loadClinicalNotes(patientKey).map((n) => ({ ...n, latest: false }))];
  saveClinicalNotes(patientKey, updated);
  return updated;
}
