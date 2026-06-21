import { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import {
  applyDisplayPreferences,
  DISPLAY_PREFS_DEFAULTS,
  loadDisplayPreferences,
  saveDisplayPreferences,
} from '../../utils/displayPreferencesStorage';
import styles from './DisplayPreferences.module.css';

const THEMES = [
  { id: 'light', label: 'Light Mode', preview: { bg: '#f9fafb', bar: '#d1d5db' } },
  { id: 'dark', label: 'Dark Mode', preview: { bg: '#1e293b', bar: '#3b82f6' } },
  { id: 'calm', label: 'Calm Mode', preview: { bg: '#e8f5f0', bar: '#a7d7c5' } },
];

const ACCENTS = ['#2563eb', '#16a34a', '#4f46e5', '#dc2626', '#f59e0b'];

const FONT_FAMILIES = [
  'Manrope (System Default)',
  'Inter',
  'Roboto',
  'Georgia',
  'Courier New',
];

const FONT_WEIGHTS = ['Light', 'Regular', 'Bold'];

export default function DisplayPreferences() {
  const [prefs, setPrefs] = useState(loadDisplayPreferences);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    applyDisplayPreferences(prefs);
  }, [prefs]);

  function update(key, value) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setPrefs({ ...DISPLAY_PREFS_DEFAULTS });
    showToast('Preferences reset to default');
  }

  function handleSave() {
    try {
      saveDisplayPreferences(prefs);
      showToast('Preferences saved successfully');
    } catch {
      showToast('Could not save preferences');
    }
  }

  return (
    <AppLayout variant="patient" showSidebar showHeader={false}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Display Preferences</h1>
        <p className={styles.pageDesc}>
          Personalize your therapeutic environment for better focus and mental well-being.
          Changes apply instantly on this page; save to keep them next time.
        </p>

        <div className={styles.sectionHeading}>
          <span aria-hidden="true">🎨</span> Theme &amp; Visuals
        </div>
        <div className={styles.card}>
          <div className={styles.themeGrid}>
            {THEMES.map((t) => {
              const selected = prefs.theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.themeCard} ${selected ? styles.themeSelected : ''}`}
                  onClick={() => update('theme', t.id)}
                  aria-pressed={selected}
                >
                  <div className={styles.themePreview} style={{ background: t.preview.bg }}>
                    <div className={styles.themeBar} style={{ background: t.preview.bar }} />
                  </div>
                  <div className={styles.themeFooter}>
                    {t.label}
                    <span className={`${styles.radio} ${selected ? styles.radioChecked : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className={styles.accentLabel}>Accent Colors</div>
          <div className={styles.accentRow}>
            {ACCENTS.map((color) => {
              const selected = prefs.accent === color;
              return (
                <button
                  key={color}
                  type="button"
                  className={`${styles.accentDot} ${selected ? styles.accentSelected : ''}`}
                  style={{ background: color }}
                  onClick={() => update('accent', color)}
                  aria-label={`Accent color ${color}`}
                  aria-pressed={selected}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.sectionHeading}>
          <span aria-hidden="true">🔤</span> Typography
        </div>
        <div className={styles.card}>
          <div className={styles.typoGrid}>
            <div className={styles.typoCol}>
              <label className={styles.typoLabel} htmlFor="font-size">
                Font Size
              </label>
              <input
                id="font-size"
                type="range"
                min="1"
                max="3"
                step="1"
                value={prefs.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>Small</span>
                <span>Default</span>
                <span>Large</span>
              </div>
            </div>

            <div className={styles.typoCol}>
              <div className={styles.typoLabel}>Font Weight</div>
              <div className={styles.fwBtns}>
                {FONT_WEIGHTS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`${styles.fwBtn} ${prefs.fontWeight === w ? styles.fwBtnActive : ''}`}
                    onClick={() => update('fontWeight', w)}
                    aria-pressed={prefs.fontWeight === w}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.fontFamilyWrap}>
            <label className={styles.fontFamilyLabel} htmlFor="font-family">
              Font Family
            </label>
            <select
              id="font-family"
              className={styles.select}
              value={prefs.fontFamily}
              onChange={(e) => update('fontFamily', e.target.value)}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.footerBtns}>
          <button type="button" className={styles.btnReset} onClick={handleReset}>
            Reset to Default
          </button>
          <button type="button" className={styles.btnSave} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </AppLayout>
  );
}
