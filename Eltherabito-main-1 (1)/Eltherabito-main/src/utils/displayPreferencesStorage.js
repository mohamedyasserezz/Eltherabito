export const DISPLAY_PREFS_STORAGE_KEY = 'eltherabito-display-preferences';

export const DISPLAY_PREFS_DEFAULTS = {
  theme: 'calm',
  accent: '#2563eb',
  fontSize: 2,
  fontWeight: 'Regular',
  fontFamily: 'Manrope (System Default)',
};

const FONT_SIZE_MAP = { 1: '14px', 2: '16px', 3: '18px' };
const FONT_WEIGHT_MAP = { Light: '300', Regular: '400', Bold: '700' };
const FONT_FAMILY_MAP = {
  'Manrope (System Default)': "'Manrope', sans-serif",
  'Inter': "'Inter', sans-serif",
  'Roboto': "'Roboto', sans-serif",
  'Georgia': "'Georgia', serif",
  'Courier New': "'Courier New', monospace",
};

const THEME_VARS = {
  light: { '--pref-bg': '#f9fafb', '--pref-surface': '#ffffff', '--pref-text': '#1f2937' },
  dark: { '--pref-bg': '#0f172a', '--pref-surface': '#1e293b', '--pref-text': '#f8fafc' },
  calm: { '--pref-bg': '#e8f5f0', '--pref-surface': '#ffffff', '--pref-text': '#1f2937' },
};

export function loadDisplayPreferences() {
  try {
    const raw = localStorage.getItem(DISPLAY_PREFS_STORAGE_KEY);
    if (!raw) return { ...DISPLAY_PREFS_DEFAULTS };
    return { ...DISPLAY_PREFS_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DISPLAY_PREFS_DEFAULTS };
  }
}

export function saveDisplayPreferences(prefs) {
  localStorage.setItem(DISPLAY_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function applyDisplayPreferences(prefs) {
  const root = document.documentElement;
  const themeVars = THEME_VARS[prefs.theme] || THEME_VARS.calm;

  root.style.setProperty('--pref-accent', prefs.accent);
  root.style.setProperty('--pref-font-size', FONT_SIZE_MAP[prefs.fontSize] || '16px');
  root.style.setProperty('--pref-font-weight', FONT_WEIGHT_MAP[prefs.fontWeight] || '400');
  root.style.setProperty('--pref-font-family', FONT_FAMILY_MAP[prefs.fontFamily] || "'Manrope', sans-serif");
  root.style.setProperty('--pref-bg', themeVars['--pref-bg']);
  root.style.setProperty('--pref-surface', themeVars['--pref-surface']);
  root.style.setProperty('--pref-text', themeVars['--pref-text']);
}

export function initDisplayPreferences() {
  applyDisplayPreferences(loadDisplayPreferences());
}
